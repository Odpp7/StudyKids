console.log('AppEvents cargado (estructura limpia)');

const pageContent = document.getElementById('page-content');

// Variable global para guardar ID a eliminar
let estudianteIdAEliminar = null;

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

  // Ver info detallada estudiante
  if (e.target.closest('.btn-view')) {
    const btn = e.target.closest('.btn-view');
    const id = Number(btn.dataset.id);
    openViewModal(id);
  }

  // Cerrar modal info detallada
  if (
    e.target.closest('#view-modal-close') ||
    e.target.id === 'view-student-modal'
  ) {
    closeViewModal();
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

  // Abrir modal editar
  if (e.target.closest('.btn-edit')) {
    const btn = e.target.closest('.btn-edit');
    const id = Number(btn.dataset.id);

    // Primero abrir el modal
    const modal = document.getElementById('student-modal');
    modal.classList.add('active');

    // Luego cambiar título y cargar datos
    document.getElementById('modal-title').innerHTML = '<i class="fa-solid fa-pencil"></i> Editar Estudiante';
    openEditModal(id);
  }


  // ✅ ELIMINAR ESTUDIANTE - Abrir modal de confirmación
  if (e.target.closest('.btn-delete')) {
    const btn = e.target.closest('.btn-delete');
    estudianteIdAEliminar = btn.dataset.id;
    
    // Abrir modal de confirmación
    document.getElementById('confirm-modal').classList.add('active');
  }

  // Cerrar modal de confirmación
  if (
    e.target.closest('#confirm-cancel') ||
    e.target.closest('#confirm-no') ||
    e.target.id === 'confirm-modal'
  ) {
    document.getElementById('confirm-modal').classList.remove('active');
    estudianteIdAEliminar = null;
  }

  // Confirmar eliminación
  if (e.target.closest('#confirm-yes')) {
    if (estudianteIdAEliminar) {
      window.api.eliminarEstudiante(Number(estudianteIdAEliminar))
        .then(() => {
          changeTurn(document.querySelector('.turn-btn.active').dataset.turn);
          document.getElementById('confirm-modal').classList.remove('active');
          estudianteIdAEliminar = null;
        })
        .catch((error) => {
          document.getElementById('confirm-modal').classList.remove('active');
          estudianteIdAEliminar = null;
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

  // ✅ Ver concepto/historial - ACTUALIZADO
  if (e.target.closest('.btn-concept')) {
    const btn = e.target.closest('.btn-concept');
    const estudianteId = btn.dataset.estudiante;
    openHistorialModal(Number(estudianteId));
  }

  // Cerrar modal de pago
  if (
    e.target.closest('#payment-modal-close') ||
    e.target.closest('#payment-btn-cancel') ||
    e.target.id === 'payment-modal'
  ) {
    closePaymentModal();
  }

  // ✅ Cerrar modal de historial
  if (
    e.target.closest('#historial-modal-close') ||
    e.target.closest('#historial-btn-close') ||
    e.target.id === 'historial-modal'
  ) {
    closeHistorialModal();
  }

  // Generar factura
  if (e.target.closest('.btn-factura')) {
    const btn = e.target.closest('.btn-factura');
    const estudianteId = btn.dataset.estudiante;

    const mesActual = document.getElementById('month-filter').value;
    const anioActual = new Date().getFullYear();

    window.api.generarFactura(Number(estudianteId), mesActual, anioActual)
      .then(resultado => {
        if (resultado.success) {
          alert(`✅ Factura generada exitosamente\n\nArchivo: ${resultado.nombreArchivo}\n\nGuardada en: Documentos/StudyKids/Facturas/`);
        }
      })
      .catch(error => {
        alert('❌ Error al generar factura: ' + error.message);
      });
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

    // Actualizar variable global
    window.mesActualPagos = mesSeleccionado;

    // Recargar tabla Y estadísticas
    if (window.changeTurnPagos && window.turnoActualPagos) {
      window.changeTurnPagos(window.turnoActualPagos);
    }
  }

  // Cambiar tipo de pago en el modal
  if (e.target.id === 'payment-tipo') {
    const tipo = e.target.value;
    const mesContainer = document.getElementById('payment-mes-container');
    const rangoContainer = document.getElementById('payment-rango-container');
    const mesSelect = document.getElementById('payment-mes');
    const fechaDesde = document.getElementById('payment-fecha-desde');
    const fechaHasta = document.getElementById('payment-fecha-hasta');

    if (tipo === 'adelantado') {
      if (mesContainer) mesContainer.style.display = 'none';
      if (rangoContainer) rangoContainer.style.display = 'block';
      if (mesSelect) mesSelect.removeAttribute('required');
      if (fechaDesde) fechaDesde.setAttribute('required', 'required');
      if (fechaHasta) fechaHasta.setAttribute('required', 'required');
    } else {
      if (mesContainer) mesContainer.style.display = 'block';
      if (rangoContainer) rangoContainer.style.display = 'none';
      if (mesSelect) mesSelect.setAttribute('required', 'required');
      if (fechaDesde) fechaDesde.removeAttribute('required');
      if (fechaHasta) fechaHasta.removeAttribute('required');
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

  if (e.target.id === 'search-students') {
    BuscarEstudiantesPorNombre(e.target.value);
  }

  /* ===================== PAGOS ===================== */

  if (e.target.id === 'search-payments') {
    BuscarPagosPorNombre(e.target.value);
  }

  /* ===================== PADRES ===================== */
  // (pendiente)

});