console.log('AppEvents cargado (estructura limpia)');

const pageContent = document.getElementById('page-content');

/* ======================================================
   CLICK EVENTS
====================================================== */
pageContent.addEventListener('click', (e) => {

  /* ===================== ESTUDIANTES ===================== */

  // Abrir modal nuevo estudiante
  if (e.target.closest('#btn-new-student')) {
    if (window.openStudentModal) openStudentModal();
  }

  // Cerrar modal
  if (
    e.target.closest('#modal-close') ||
    e.target.closest('#btn-cancel') ||
    e.target.id === 'student-modal'
  ) {
    if (window.closeStudentModal) closeStudentModal();
  }

  // Ver estudiante
  if (e.target.closest('.btn-view')) {
    const row = e.target.closest('tr');
    if (window.viewStudent) viewStudent(row);
  }

  // Editar estudiante
  if (e.target.closest('.btn-edit')) {
    const row = e.target.closest('tr');
    if (window.editStudent) editStudent(row);
  }

  // Eliminar estudiante
  if (e.target.closest('.btn-delete')) {
    const row = e.target.closest('tr');
    if (window.deleteStudent) deleteStudent(row);
  }

  // Cambiar jornada (vista tabla)
  if (e.target.closest('.turn-btn')) {
    const btn = e.target.closest('.turn-btn');
    const turn = btn.dataset.turn;

    document.querySelectorAll('.turn-btn')
      .forEach(b => b.classList.remove('active'));

    btn.classList.add('active');

    if (window.changeTurn) changeTurn(turn);
  }

  // Cambiar jornada (formulario)
  if (e.target.name === 'turno') {
    const turn = e.target.value;
    if (window.changeFormTurn) changeFormTurn(turn);
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
    if (window.saveStudent) saveStudent(e);
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
