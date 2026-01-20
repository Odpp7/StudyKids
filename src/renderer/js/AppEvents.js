console.log('AppEvents cargado (estructura limpia)');

const pageContent = document.getElementById('page-content');

/* ======================================================
   CLICK EVENTS
====================================================== */
pageContent.addEventListener('click', (e) => {

  /* ===================== ESTUDIANTES ===================== */

  // Abrir modal nuevo estudiante
  if (e.target.closest('#btn-new-student')) {
    openStudentModal();
  }

  // Cerrar modal
  if (
    e.target.closest('#modal-close') ||
    e.target.closest('#btn-cancel') ||
    e.target.id === 'student-modal'
  ) {
    closeStudentModal();
  }

  // Cambiar jornada (vista tabla)
  if (e.target.closest('.turn-btn')) {
    const btn = e.target.closest('.turn-btn');
    document.querySelectorAll('.turn-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    changeTurn(btn.dataset.turn);
  }

  // Cambiar jornada (formulario)
  if (e.target.name === 'turno') {
    changeFormTurn(e.target.value);
  }

  // Editar estudiante
  if (e.target.closest('.btn-edit')) {
    const btn = e.target.closest('.btn-edit');
    const id = Number(btn.dataset.id);
    
    document.getElementById('modal-title').textContent = 'Editar Estudiante';
    document.getElementById('student-modal').style.display = 'flex';
    openEditModal(id);
  }

  // Eliminar estudiante
  if (e.target.closest('.btn-delete')) {
    const btn = e.target.closest('.btn-delete');
    const id = btn.dataset.id;

    if (confirm('¿Eliminar este estudiante?')) {
      window.api.eliminarEstudiante(Number(id))
        .then(() => {
          alert('Estudiante eliminado');
          changeTurn(
            document.querySelector('.turn-btn.active').dataset.turn
          );
        });
    }
  }


  /* ===================== PAGOS ===================== */
  // (pendiente)
  // if (e.target.closest('#btn-new-payment')) {}

  /* ===================== PADRES ===================== */
  // (pendiente)

  /* ===================== REPORTES ===================== */
  // (pendiente)

  /* ===================== CALENDARIO ===================== */
  // (pendiente)

});


/* ======================================================
   SUBMIT EVENTS
====================================================== */
pageContent.addEventListener('submit', (e) => {

  /* ===================== ESTUDIANTES ===================== */
  if (e.target.id === 'student-form') {
    saveStudent(e);
  }

  /* ===================== PAGOS ===================== */
  // (pendiente)

});


/* ======================================================
   CHANGE EVENTS
====================================================== */
pageContent.addEventListener('change', (e) => {

  /* ===================== ESTUDIANTES ===================== */
  // (pendiente)

  /* ===================== REPORTES ===================== */
  // (pendiente)

});


/* ======================================================
   INPUT EVENTS
====================================================== */
pageContent.addEventListener('input', (e) => {

  /* ===================== ESTUDIANTES ===================== */
  // if (e.target.id === 'search-students') {}

  /* ===================== PADRES ===================== */
  // (pendiente)

});
