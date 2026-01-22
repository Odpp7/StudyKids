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

  // Cambiar jornada (vista tabla)
  if (e.target.closest('.turn-btn-pagos')) {
    const btn = e.target.closest('.turn-btn-pagos');
    document.querySelectorAll('.turn-btn-pagos')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    changeTurnPagos(btn.dataset.turn);
  }

  // Abrir modal de pago
  if (e.target.closest('.btn-pay')) {
    const btn = e.target.closest('.btn-pay');
    const estudianteId = btn.dataset.estudiante;
    openPaymentModal(estudianteId);
  }

  // Ver concepto/historial
  if (e.target.closest('.btn-concept')) {
    const btn = e.target.closest('.btn-concept');
    const estudianteId = btn.dataset.estudiante;
    // Aquí puedes abrir un modal para ver el historial de pagos
    alert('Función de historial en desarrollo para estudiante ID: ' + estudianteId);
  }

  // Cerrar modal de pago
  if (
    e.target.closest('#payment-modal-close') ||
    e.target.closest('#payment-btn-cancel') ||
    e.target.id === 'payment-modal'
  ) {
    closePaymentModal();
  }

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
  if (e.target.id === 'payment-form') {
    registrarPago(e);
  }

});


/* ======================================================
   CHANGE EVENTS
====================================================== */
pageContent.addEventListener('change', (e) => {

  /* ===================== ESTUDIANTES ===================== */
  // (pendiente)

  /* ===================== PAGOS ===================== */
  // Cambiar mes en el filtro de pagos
  if (e.target.id === 'month-filter') {
    const mesSeleccionado = e.target.value;
    const turnoActivo = document.querySelector('.turn-btn-pagos.active');

    if (turnoActivo && window.changeTurnPagos) {
      const turno = turnoActivo.dataset.turn;
      
      if (window.mesActualPagos !== undefined) {
        window.mesActualPagos = mesSeleccionado;
      }
      
      changeTurnPagos(turno);
    }
  }

  /* ===================== REPORTES ===================== */
  // (pendiente)

});


/* ======================================================
   INPUT EVENTS
====================================================== */
pageContent.addEventListener('input', (e) => {

  /* ===================== ESTUDIANTES ===================== */
  // if (e.target.id === 'search-students') {}

  /* ===================== PAGOS ===================== */
  // (pendiente)

  /* ===================== PADRES ===================== */
  // (pendiente)

});