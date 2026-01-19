console.log('Estudiantes cargado (versión limpia)');

// ===================== MODAL =====================

window.openStudentModal = function () {
    const modal = document.getElementById('student-modal');
    const form = document.getElementById('student-form');
    const title = document.getElementById('modal-title');

    form.reset();
    title.textContent = 'Nuevo Estudiante';
    modal.style.display = 'flex';
};

window.closeStudentModal = function () {
    const modal = document.getElementById('student-modal');
    modal.style.display = 'none';
};

// ===================== ACCIONES =====================

window.viewStudent = function (row) {
    const name = row.querySelector('.student-info div div').textContent;
    alert(` Ver estudiante:\n${name}`);
};

window.editStudent = function (row) {
    const name = row.querySelector('.student-info div div').textContent;
    alert(`Editar estudiante:\n${name}`);
};

window.deleteStudent = function (row) {
    const name = row.querySelector('.student-info div div').textContent;
    if (confirm(`¿Eliminar a ${name}?`)) {
        alert('Estudiante eliminado');
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

// ===================== GUARDAR EN BD =====================

// Evitar múltiples listeners
if (!window.studentFormInitialized) {
    window.studentFormInitialized = true;
    
    document.getElementById('student-form').addEventListener('submit', saveStudent);
    
    async function saveStudent(e) {
        e.preventDefault();
        
        // Prevenir envíos múltiples
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn.disabled) return;
        submitBtn.disabled = true;
        
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

        try {
            const id = await window.api.crearEstudiante(estudiante);
            console.log('Estudiante creado con ID:', id);

            alert('Estudiante guardado correctamente');
            closeStudentModal();
        } catch (error) {
            console.error('Error completo:', error);
            alert('Error al guardar el estudiante: ' + error.message);
        } finally {
            submitBtn.disabled = false;
        }
    }
}