// ===================== MODAL =====================

window.openStudentModal = function () {
    const modal = document.getElementById('student-modal');
    const form = document.getElementById('student-form');

    document.activeElement?.blur();

    form.reset();
    delete form.dataset.editingId;

    modal.classList.add('active');
    document.getElementById('modal-title').innerHTML = '<i class="fa-solid fa-plus"></i> Nuevo Estudiante';
};


window.closeStudentModal = function () {
    const modal = document.getElementById('student-modal');
    const form = document.getElementById('student-form');

    document.activeElement?.blur();

    form.reset();
    delete form.dataset.editingId;

    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = false;

    modal.classList.remove('active');
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
            observacion: document.getElementById('student-notes').value || null
        };

        const editingId = e.target.dataset.editingId;

        if (editingId) {
            await window.api.actualizarEstudiante(Number(editingId), estudiante);
            delete e.target.dataset.editingId;
        } else {
            const acudiente = {
                nombre: document.getElementById('parent-name').value,
                telefono: document.getElementById('parent-phone').value,
                email: document.getElementById('parent-email').value || null,
                relacion: document.getElementById('parent-relation').value
            };

            await window.api.crearEstudiante({ estudiante, acudiente });
        }
        
        const turnoActual = document.querySelector('.turn-btn.active').dataset.turn;
        await cargarEstudiantes(turnoActual);
        await cargarEstadisticas(turnoActual);
        
        closeStudentModal();

    } catch (err) {
        console.error(err);
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

    } catch (error) {
        console.error('Error cargando estudiantes:', error);
    }
}


// ===================== MODAL VER ESTUDIANTE =====================

window.openViewModal = async function (id) {
    try {
        const estudiante = await window.api.obtenerEstudiantePorId(id);
        
        if (!estudiante) {
            alert('Estudiante no encontrado');
            return;
        }

        const modal = document.getElementById('view-student-modal');
        modal.dataset.studentId = id;

        // Avatar
        const iniciales = estudiante.nombre
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
        document.getElementById('view-avatar').textContent = iniciales;

        // Header
        document.getElementById('view-student-name').textContent = estudiante.nombre;
        
        const turnoTexto = estudiante.turno === 'manana' ? 'Jornada Mañana' : 'Jornada Tarde';
        document.getElementById('view-student-grade-turno').textContent = 
            `${estudiante.grado} - ${turnoTexto}`;

        // Información Personal
        document.getElementById('view-birthdate').textContent = 
            estudiante.fecha_nacimiento || '-';
        document.getElementById('view-age').textContent = 
            estudiante.edad ? `${estudiante.edad} años` : '-';
        document.getElementById('view-address').textContent = 
            estudiante.direccion || 'No especificada';
        document.getElementById('view-start-date').textContent = 
            estudiante.fecha_inicio || '-';

        // Información Académica (solo para turno tarde)
        const academicSection = document.getElementById('view-academic-info');
        if (estudiante.turno === 'tarde' && estudiante.colegio) {
            academicSection.classList.remove('hidden');
            document.getElementById('view-school').textContent = estudiante.colegio;
            document.getElementById('view-grade').textContent = estudiante.grado;
        } else {
            academicSection.classList.add('hidden');
        }

        // Acudiente
        document.getElementById('view-parent-name').textContent = 
            estudiante.acudiente_nombre || 'No registrado';
        document.getElementById('view-parent-relation').textContent = 
            estudiante.acudiente_relacion || '-';
        document.getElementById('view-parent-phone').textContent = 
            estudiante.acudiente_telefono || '-';
        document.getElementById('view-parent-email').textContent = 
            estudiante.acudiente_email || 'No registrado';

        // Información de Pago
        document.getElementById('view-fee').textContent = 
            `$${Number(estudiante.mensualidad).toLocaleString('es-CO')}`;

        // Observaciones
        const notesSection = document.getElementById('view-notes-section');
        const notesElement = document.getElementById('view-notes');
        if (estudiante.observacion && estudiante.observacion.trim() !== '') {
            notesElement.textContent = estudiante.observacion;
            notesSection.style.display = 'block';
        } else {
            notesElement.textContent = 'Sin observaciones registradas';
            notesSection.style.display = 'block';
        }

        // Mostrar modal
        modal.classList.add('active');

    } catch (error) {
        console.error('Error cargando información del estudiante:', error);
        alert('Error al cargar la información del estudiante');
    }
};

window.closeViewModal = function () {
    const modal = document.getElementById('view-student-modal');
    document.activeElement?.blur();
    modal.classList.remove('active');
    delete modal.dataset.studentId;
};


// ===================== INICIALIZACIÓN =====================

changeTurn('manana');