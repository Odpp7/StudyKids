console.log('Estudiantes cargado (versión limpia)');

// ===================== MODAL =====================

window.openStudentModal = function () {
    document.getElementById('student-form').reset();
    document.getElementById('student-modal').style.display = 'flex';
    document.getElementById('modal-title').textContent = 'Nuevo Estudiante';
}

window.closeStudentModal = function () {
    const form = document.getElementById('student-form');
    form.reset();
    delete form.dataset.editingId; 
    document.getElementById('student-modal').style.display = 'none';
};

window.openEditModal = async function (id) {
    try {
        const estudiante = await window.api.obtenerEstudiantePorId(id);
        
        if (!estudiante) {
            alert('Estudiante no encontrado');
            return;
        }

        document.getElementById('student-name').value = estudiante.nombre || '';
        document.getElementById('student-birthdate').value = estudiante.fecha_nacimiento || '';
        document.getElementById('student-age').value = estudiante.edad || '';
        document.getElementById('student-address').value = estudiante.direccion || '';
        document.getElementById('student-fee').value = estudiante.mensualidad || '';
        document.getElementById('student-start-date').value = estudiante.fecha_inicio || '';
        document.getElementById('payment-status').value = estudiante.estado_pago || 'al-dia';
        document.getElementById('student-notes').value = estudiante.observacion || '';

        const radioTurno = document.querySelector(`input[name="turno"][value="${estudiante.turno}"]`);
        if (radioTurno) {
            radioTurno.checked = true;
            changeFormTurn(estudiante.turno);
        }

        if (estudiante.turno === 'tarde') {
            document.getElementById('student-school').value = estudiante.colegio || '';
            document.getElementById('student-grade-tarde').value = estudiante.grado || '';
        } else {
            document.getElementById('student-grade-manana').value = estudiante.grado || '';
        }

        document.getElementById('parent-name').value = estudiante.acudiente_nombre || '';
        document.getElementById('parent-phone').value = estudiante.acudiente_telefono || '';
        document.getElementById('parent-email').value = estudiante.acudiente_email || '';
        document.getElementById('parent-relation').value = estudiante.acudiente_relacion || '';

        document.getElementById('student-form').dataset.editingId = id;

    } catch (error) {
        console.error('Error cargando estudiante:', error);
        alert('Error al cargar los datos del estudiante');
    }
};

// ===================== JORNADAS =====================

window.changeTurn = function (turn) {
    const tableManana = document.getElementById('students-table-manana');
    const tableTarde = document.getElementById('students-table-tarde');
    const title = document.getElementById('table-title');

    if (turn === 'manana') {
        tableManana.style.display = 'table';
        tableTarde.style.display = 'none';
        title.textContent = 'Estudiantes - Jornada de Mañana';
    } else {
        tableManana.style.display = 'none';
        tableTarde.style.display = 'table';
        title.textContent = 'Estudiantes - Jornada de Tarde';
    }

    cargarEstudiantes(turn);
    cargarEstadisticas(turn);
}

window.changeFormTurn = function (turn) {
    const academic = document.getElementById('academic-section');
    const grade = document.getElementById('grade-section');

    if (turn === 'tarde') {
        academic.style.display = 'block';
        grade.style.display = 'none';
    } else {
        academic.style.display = 'none';
        grade.style.display = 'block';
    }
}

// ===================== CRUD  =====================

window.saveStudent = async function (e) {
    e.preventDefault();

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;

    try {
        const turno = document.querySelector('input[name="turno"]:checked').value;

        const estudiante = {
            turno,
            nombre: document.getElementById('student-name').value,
            fecha_nacimiento: document.getElementById('student-birthdate').value,
            edad: document.getElementById('student-age').value || null,
            direccion: document.getElementById('student-address').value || null,
            colegio: turno === 'tarde' ? document.getElementById('student-school').value : null,
            grado: turno === 'tarde' ? document.getElementById('student-grade-tarde').value : document.getElementById('student-grade-manana').value,
            mensualidad: document.getElementById('student-fee').value,
            fecha_inicio: document.getElementById('student-start-date').value,
            estado_pago: document.getElementById('payment-status').value,
            observacion: document.getElementById('student-notes').value || null
        };

        const editingId = e.target.dataset.editingId;

        if (editingId) {
            await window.api.actualizarEstudiante(Number(editingId), estudiante);
            alert('Estudiante actualizado correctamente');
            delete e.target.dataset.editingId;
        } else {
            const acudiente = {
                nombre: document.getElementById('parent-name').value,
                telefono: document.getElementById('parent-phone').value,
                email: document.getElementById('parent-email').value || null,
                relacion: document.getElementById('parent-relation').value
            };

            await window.api.crearEstudiante({ estudiante, acudiente });
            alert('Estudiante guardado correctamente');
        }
        
        const turnoActual = document.querySelector('.turn-btn.active').dataset.turn;
        await cargarEstudiantes(turnoActual);
        await cargarEstadisticas(turnoActual);
        
        closeStudentModal();

    } catch (err) {
        console.error(err);
        alert('Error al guardar estudiante');
    } finally {
        btn.disabled = false;
    }
};

// ==================== ESTADÍSTICAS =====================

async function cargarEstadisticas(turno) {
    try {
        const stats = await window.api.obtenerEstadisticasEstudiantes(turno);

        document.getElementById('stat-total').textContent = stats.total || 0;
        document.getElementById('stat-paid').textContent = stats.alDia || 0;
        document.getElementById('stat-pending').textContent = stats.pendientes || 0;
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}


// ==================== BUSQUEDA ===========================

window.BuscarEstudiantesPorNombre = function (searchTerm) {
    const turnoActivo = document.querySelector('.turn-btn.active')?.dataset.turn || 'manana';

    const tbodyId = turnoActivo === 'manana' ? 'students-tbody-manana' : 'students-tbody-tarde';

    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const rows = tbody.querySelectorAll('tr');
    const searchLower = searchTerm.toLowerCase().trim();

    rows.forEach(row => {
        const nombre = row.querySelector('.student-info div div')?.textContent.toLowerCase() || '';
        row.style.display = nombre.includes(searchLower) ? '' : 'none';
    });
};

// ===================== LISTAR =====================

async function cargarEstudiantes(turno) {
    try {
        const estudiantes = await window.api.listarEstudiantes(turno);
        const tbody = document.getElementById(turno === 'manana' ? 'students-tbody-manana' : 'students-tbody-tarde');

        tbody.innerHTML = '';

        estudiantes.forEach(est => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
        <td>
          <div class="student-info">
            <div class="student-avatar">
              ${est.nombre.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style="font-weight:600;">${est.nombre}</div>
              <div style="font-size:12px;color:#718096;">
                Inicio: ${est.fecha_inicio}
              </div>
            </div>
          </div>
        </td>
        <td>${est.edad || 'N/A'}</td>
        <td>${est.fecha_nacimiento}</td>
        <td>${est.acudiente_nombre || 'N/A'}</td>
        <td>${est.grado}</td>
        <td>$${est.mensualidad}</td>
        <td>
          <span class="status-badge ${est.estado_pago === 'pendiente'
                    ? 'status-pending'
                    : 'status-active'
                }">
            ${est.estado_pago === 'pendiente' ? 'Pendiente' : 'Al día'}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="action-btn btn-view" data-id="${est.id}">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="action-btn btn-edit" data-id="${est.id}">
              <i class="fa-solid fa-pencil"></i>
            </button>
            <button class="action-btn btn-delete" data-id="${est.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      `;

            tbody.appendChild(tr);
        });

        console.log(`✅ ${estudiantes.length} estudiantes cargados`);

    } catch (error) {
        console.error('Error cargando estudiantes:', error);
    }
}

// ===================== INICIALIZACIÓN =====================

changeTurn('manana');
