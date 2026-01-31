// ===================== VARIABLES GLOBALES =====================
window.turnoActualPagos = 'manana';
window.mesActualPagos = '';
window.anioActualPagos = new Date().getFullYear();

// ===================== JORNADAS =====================
window.changeTurnPagos = function (turno) {
    window.turnoActualPagos = turno;

    const tableManana = document.getElementById('payments-table-manana');
    const tableTarde = document.getElementById('payments-table-tarde');

    if (!tableManana || !tableTarde) return;

    tableManana.style.display = turno === 'manana' ? 'table' : 'none';
    tableTarde.style.display = turno === 'tarde' ? 'table' : 'none';

    cargarPagosPorMes(turno, window.mesActualPagos, window.anioActualPagos);
    cargarEstadisticas(turno, window.mesActualPagos, window.anioActualPagos);
};

// ===================== ESTADÍSTICAS =====================
async function cargarEstadisticas(turno, mes, anio) {
    try {
        const stats = await window.api.obtenerEstadisticasPagos(turno, mes, anio);

        // Actualizar los valores en el HTML
        document.querySelector('.payment-card.total .payment-value').textContent =
            `$${stats.totalEsperado.toLocaleString()}`;

        document.querySelector('.payment-card.pending .payment-value').textContent =
            stats.countPendientes;
        document.querySelector('.payment-card.pending .payment-secondary').textContent =
            `$${stats.totalPendiente.toLocaleString()} por recibir`;

        document.querySelector('.payment-card.completed .payment-value').textContent =
            stats.countCompletados;
        document.querySelector('.payment-card.completed .payment-secondary').textContent =
            `$${stats.totalRecibido.toLocaleString()} recibido`;

    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// ===================== MODAL DE PAGO =====================
window.openPaymentModal = function (estudianteId) {
    document.getElementById('payment-form').reset();
    document.getElementById('payment-modal').style.display = 'flex';

    if (estudianteId) {
        cargarDatosEstudianteEnModal(estudianteId);
    }
}

window.closePaymentModal = function () {
    const form = document.getElementById('payment-form');
    form.reset();
    delete form.dataset.editingId;
    document.getElementById('payment-modal').style.display = 'none';
};

async function cargarDatosEstudianteEnModal(estudianteId) {
    try {
        const estudiante = await window.api.obtenerEstudiantePorId(estudianteId);

        if (estudiante) {
            document.getElementById('payment-estudiante-id').value = estudiante.id;
            document.getElementById('payment-student-name').textContent = estudiante.nombre;
            document.getElementById('payment-mensualidad').textContent = `$${estudiante.mensualidad}`;
        }
    } catch (error) {
        alert('Error al cargar los datos del estudiante');
    }
}

// ===================== MODAL DE HISTORIAL =====================
window.openHistorialModal = async function (estudianteId) {
    const modal = document.getElementById('historial-modal');
    modal.style.display = 'flex';

    try {
        // Usar las variables globales de mes y año actuales
        const mes = window.mesActualPagos;
        const anio = window.anioActualPagos;

        const historial = await window.api.obtenerHistorialPagos(estudianteId, mes, anio);

        // Llenar información del estudiante
        document.getElementById('historial-student-name').textContent = historial.estudiante.nombre;
        document.getElementById('historial-mes').textContent = mes.charAt(0).toUpperCase() + mes.slice(1);
        document.getElementById('historial-anio').textContent = anio;
        document.getElementById('historial-mensualidad').textContent = 
            `$${historial.estudiante.mensualidad.toLocaleString()}`;
        document.getElementById('historial-total-pagado').textContent = 
            `$${historial.resumen.totalPagado.toLocaleString()}`;

        // Mostrar pendiente
        const pendienteContainer = document.getElementById('historial-pendiente-container');
        const pendienteElement = document.getElementById('historial-pendiente');
        
        if (historial.resumen.pendiente > 0) {
            pendienteContainer.style.display = 'block';
            pendienteElement.textContent = `$${historial.resumen.pendiente.toLocaleString()}`;
        } else {
            pendienteContainer.style.display = 'block';
            pendienteElement.textContent = '$0 - Completado';
        }

        // Llenar tabla de historial
        const tbody = document.getElementById('historial-tbody');
        tbody.innerHTML = '';

        if (historial.pagos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #999;">
                        <i class="fa-solid fa-inbox"></i><br>
                        No hay pagos registrados para este mes
                    </td>
                </tr>
            `;
        } else {
            historial.pagos.forEach((pago, index) => {
                const tipoPagoTexto = {
                    'abono': 'Abono',
                    'pago-mes': 'Pago Completo',
                    'adelantado': 'Pago Adelantado'
                };

                const metodoPagoTexto = {
                    'efectivo': 'Efectivo',
                    'transferencia': 'Transferencia',
                    'daviplata': 'Daviplata',
                    'nequi': 'Nequi',
                    'tarjeta': 'Tarjeta'
                };

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${pago.fecha_pago}</td>
                    <td><strong>$${pago.monto.toLocaleString()}</strong></td>
                    <td>${metodoPagoTexto[pago.metodo_pago] || pago.metodo_pago}</td>
                    <td>${tipoPagoTexto[pago.tipo_pago] || pago.tipo_pago}</td>
                    <td>${pago.concepto || '-'}</td>
                `;
                tbody.appendChild(tr);
            });
        }

    } catch (error) {
        console.error('Error al cargar historial:', error);
        alert('Error al cargar el historial de pagos: ' + error.message);
        closeHistorialModal();
    }
}

window.closeHistorialModal = function () {
    document.getElementById('historial-modal').style.display = 'none';
};

// ===================== INIT =====================
initPagos();

function initPagos() {
    const fecha = new Date();
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    window.mesActualPagos = meses[fecha.getMonth()];
    window.anioActualPagos = fecha.getFullYear();

    const monthFilter = document.getElementById('month-filter');
    if (monthFilter) {
        monthFilter.value = window.mesActualPagos;
    }

    setTurnoActivo('manana');
    window.changeTurnPagos('manana');
}

// ===================== UI =====================
function setTurnoActivo(turno) {
    document.querySelectorAll('.turn-btn-pagos')
        .forEach(b => b.classList.remove('active'));

    const btn = document.querySelector(
        `.turn-btn-pagos[data-turn="${turno}"]`
    );

    if (btn) btn.classList.add('active');
}

// ===================== LISTAR DATOS =====================
async function cargarPagosPorMes(turno, mes, anio) {
    try {
        const pagos = await window.api.listarPagosPorMes(turno, mes, anio);
        const tbodyId = turno === 'manana' ? 'payments-tbody-manana' : 'payments-tbody-tarde';
        const tbody = document.getElementById(tbodyId);

        if (!tbody) return;

        tbody.innerHTML = '';

        pagos.forEach(pago => {
            let estadoBadge = '';
            let estadoClass = '';

            switch (pago.estado) {
                case 'completado':
                    estadoBadge = 'Pagado';
                    estadoClass = 'status-completed';
                    break;
                case 'abono':
                    estadoBadge = 'Abono';
                    estadoClass = 'status-partial';
                    break;
                default:
                    estadoBadge = 'Pendiente';
                    estadoClass = 'status-pending';
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="student-info">
                        <div class="student-avatar">${pago.nombre.substring(0, 2).toUpperCase()}</div>
                        <div>${pago.nombre}</div>
                    </div>
                </td>
                <td><strong>${pago.mensualidad.toLocaleString()}</strong></td>
                <td><strong>${pago.monto_pagado.toLocaleString()}</strong></td>
                <td>${pago.fecha_pago || '-'}</td>
                <td>${pago.concepto || '-'}</td>
                <td>
                    <span class="status-badge ${estadoClass}">${estadoBadge}</span>
                </td>
                <td style="display: flex; gap: 0.5rem;">
                    <button class="action-btn btn-pay" style="color:darkgreen" data-estudiante="${pago.id}">
                        <i class="fa-solid fa-hand-holding-dollar"></i>
                    </button>
                    <button class="action-btn btn-concept" style="color: blue" data-estudiante="${pago.id}">
                        <i class="fa-solid fa-book-open"></i>
                    </button>
                    <button class="action-btn btn-factura" style="color: black" data-estudiante="${pago.id}">
                        <i class="fa-solid fa-clipboard"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        alert("error al cargar los pagos" + err.message);
    }
}

// ==================== BUSQUEDA ===========================

window.BuscarPagosPorNombre = function (searchTerm) {
    const turnoActivo = window.turnoActualPagos || 'manana';

    const tbodyId = turnoActivo === 'manana' ? 'payments-tbody-manana' : 'payments-tbody-tarde';

    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const rows = tbody.querySelectorAll('tr');
    const searchLower = searchTerm.toLowerCase().trim();

    rows.forEach(row => {
        const nombre = row.querySelector('.student-info div:last-child')?.textContent.toLowerCase() || '';
        row.style.display = nombre.includes(searchLower) ? '' : 'none';
    });
};


// ===================== FORMATEAR MENSUALIDAD CON PUNTOS =====================

document.getElementById('payment-monto')?.addEventListener('input', function(e) {

    let valor = e.target.value.replace(/\./g, '');
    
    valor = valor.replace(/[^\d]/g, '');
    
    if (valor) {
        e.target.value = Number(valor).toLocaleString('es-CO');
    } else {
        e.target.value = '';
    }
});

// Al enviar el formulario, quitar los puntos para que se guarde como número
document.getElementById('payment-form')?.addEventListener('submit', function(e) {
    const feeInput = document.getElementById('payment-monto');
    if (feeInput && feeInput.value) {

        feeInput.value = feeInput.value.replace(/\./g, '');
    }
});


// ===================== REGISTRAR PAGO =====================
window.registrarPago = async function (e) {
    e.preventDefault();

    const estudianteId = document.getElementById('payment-estudiante-id').value;
    const tipoPago = document.getElementById('payment-tipo').value;
    const mes = document.getElementById('payment-mes').value;
    const monto = parseFloat(document.getElementById('payment-monto').value);
    const fechaPago = document.getElementById('payment-fecha').value;
    const metodoPago = document.getElementById('payment-metodo').value;
    const concepto = document.getElementById('payment-concepto').value;

    if (!estudianteId) {
        alert('Error: No se ha seleccionado un estudiante');
        return;
    }

    if (!tipoPago || !monto || !fechaPago || !metodoPago) {
        return;
    }

    // Validar mes o rango según tipo de pago
    let mesesSeleccionados = [];

    if (tipoPago === 'adelantado') {
        const checkboxes = document.querySelectorAll('#payment-rango-container input[type="checkbox"]:checked');
        mesesSeleccionados = Array.from(checkboxes).map(cb => cb.value);

        if (mesesSeleccionados.length === 0) {
            alert('Debes seleccionar al menos un mes para pago adelantado');
            return;
        }
    } else {
        if (!mes) {
            alert('Debes seleccionar el mes del pago');
            return;
        }
        mesesSeleccionados = [mes];
    }

    try {
        // Obtener año de la fecha de pago
        let anio = new Date(fechaPago).getFullYear();
        if (!anio || isNaN(anio)) {
            anio = new Date().getFullYear();
        }

        // Registrar pagos
        if (tipoPago === 'adelantado') {
            for (const mesItem of mesesSeleccionados) {
                const data = {
                    estudiante_id: parseInt(estudianteId),
                    tipo_pago: tipoPago,
                    mes: mesItem,
                    anio: anio,
                    monto: parseFloat((monto / mesesSeleccionados.length).toFixed(2)),
                    fecha_pago: fechaPago,
                    metodo_pago: metodoPago,
                    concepto: concepto || `Pago adelantado - ${mesItem}`
                };

                await window.api.registrarPago(data);
            }
        } else {
            const data = {
                estudiante_id: parseInt(estudianteId),
                tipo_pago: tipoPago,
                mes: mes,
                anio: anio,
                monto: parseFloat(monto),
                fecha_pago: fechaPago,
                metodo_pago: metodoPago,
                concepto: concepto || `${tipoPago === 'abono' ? 'Abono' : 'Pago completo'} - ${mes}`
            };

            await window.api.registrarPago(data);
        }

        closePaymentModal();

        // Recargar datos Y estadísticas
        cargarPagosPorMes(window.turnoActualPagos, window.mesActualPagos, window.anioActualPagos);
        cargarEstadisticas(window.turnoActualPagos, window.mesActualPagos, window.anioActualPagos);

    } catch (error) {
        alert('❌ Error al registrar el pago: ' + error.message);
    }
}