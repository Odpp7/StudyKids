
// ===================== JORNADAS =====================
window.changeTurnPagos = function (turno) {
    const tableManana = document.getElementById('payments-table-manana');
    const tableTarde = document.getElementById('payments-table-tarde');

    if (!tableManana || !tableTarde) return;

    tableManana.style.display = turno === 'manana' ? 'table' : 'none';
    tableTarde.style.display = turno === 'tarde' ? 'table' : 'none';

    cargarPagosPorMes(turno, mesActual, anioActual);
};

// ===================== MODAL =====================

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

const monthFilter = document.getElementById('month-filter');
if (monthFilter) {
    monthFilter.addEventListener('change', function () {
        mesActual = this.value;
        cargarPagosPorMes(turnoActual, mesActual, anioActual);
    });
} else {
    console.error(' No se encontró el selector de mes (month-filter)');
}

document.getElementById('payment-tipo').addEventListener('change', function () {
    const tipo = this.value;
    const mesContainer = document.getElementById('payment-mes-container');
    const rangoContainer = document.getElementById('payment-rango-container');
    const mesSelect = document.getElementById('payment-mes');
    const fechaDesde = document.getElementById('payment-fecha-desde');
    const fechaHasta = document.getElementById('payment-fecha-hasta');


    if (tipo === 'adelantado') {
        mesContainer.style.display = 'none';
        rangoContainer.style.display = 'block';
        mesSelect.removeAttribute('required');
        fechaDesde.setAttribute('required', 'required');
        fechaHasta.setAttribute('required', 'required');
    } else {
        mesContainer.style.display = 'block';
        rangoContainer.style.display = 'none';
    }
});

// ===================== INIT =====================
initPagos();

function initPagos() {

    const fecha = new Date();
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    mesActual = meses[fecha.getMonth()];
    anioActual = fecha.getFullYear();

    const monthFilter = document.getElementById('month-filter');
    if (monthFilter) {
        monthFilter.value = mesActual;
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

// ===================== DATOS =====================
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
        alert('Por favor completa todos los campos obligatorios');
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

        alert('✅ Pago registrado exitosamente');
        closePaymentModal();
        cargarPagosPorMes(window.turnoActualPagos, window.mesActualPagos, window.anioActualPagos);

    } catch (error) {
        alert(' Error al registrar el pago: ' + error.message);
    }
}

