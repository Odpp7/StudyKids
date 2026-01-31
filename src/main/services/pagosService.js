const db = require('../database/connection');

function listarPagosPorMes(turno, mes, anio) {
    const estudiantes = db.prepare(`
        SELECT id, nombre, mensualidad 
        FROM estudiantes 
        WHERE turno = ? AND activo = 1
        ORDER BY nombre ASC
    `).all(turno);

    const resultado = estudiantes.map(est => {
        const pagoMensual = db.prepare(`
            SELECT * FROM pagos_mensuales
            WHERE estudiante_id = ? AND mes = ? AND anio = ?   
        `).get(est.id, mes, anio);

        if (!pagoMensual) {
            return {
                id: est.id,
                nombre: est.nombre,
                mensualidad: est.mensualidad,
                monto_pagado: 0,
                fecha_pago: null,
                concepto: null,
                estado: 'pendiente'
            };
        };

        const ultimoPago = db.prepare(`
            SELECT fecha_pago, concepto, metodo_pago
            FROM pagos
            WHERE estudiante_id = ? AND mes = ? AND anio = ?
            ORDER BY fecha_registro DESC
            LIMIT 1
        `).get(est.id, mes, anio);

        return {
            id: est.id,
            nombre: est.nombre,
            mensualidad: est.mensualidad,
            monto_pagado: pagoMensual.total_pagado,
            fecha_pago: ultimoPago ? ultimoPago.fecha_pago : null,
            concepto: ultimoPago ? ultimoPago.concepto : null,
            metodo_pago: ultimoPago ? ultimoPago.metodo_pago : null,
            estado: pagoMensual.estado
        };
    });

    return resultado;
}

function obtenerEstadisticasPorMes(turno, mes, anio) {
    // Obtener todos los estudiantes activos del turno
    const estudiantes = db.prepare(`
        SELECT id, mensualidad 
        FROM estudiantes 
        WHERE turno = ? AND activo = 1
    `).all(turno);

    let totalEsperado = 0;
    let totalRecibido = 0;
    let countCompletados = 0;
    let countPendientes = 0;
    let countAbonos = 0;

    estudiantes.forEach(est => {
        totalEsperado += est.mensualidad;

        const pagoMensual = db.prepare(`
            SELECT total_pagado, estado 
            FROM pagos_mensuales
            WHERE estudiante_id = ? AND mes = ? AND anio = ?
        `).get(est.id, mes, anio);

        if (pagoMensual) {
            totalRecibido += pagoMensual.total_pagado;

            if (pagoMensual.estado === 'completado') {
                countCompletados++;
            } else if (pagoMensual.estado === 'abono') {
                countAbonos++;
                countPendientes++;
            } else {
                countPendientes++;
            }
        } else {
            countPendientes++;
        }
    });

    return {
        totalEsperado,
        totalRecibido,
        totalPendiente: totalEsperado - totalRecibido,
        countCompletados,
        countPendientes,
        countAbonos
    };
}

function registrarPago(data) {
    const { estudiante_id, tipo_pago, mes, monto, fecha_pago, metodo_pago, concepto } = data;

    if (!estudiante_id || !tipo_pago || !mes || !monto || !fecha_pago || !metodo_pago) {
        throw new Error('Faltan datos requeridos para registrar el pago');
    }

    let anio = data.anio;
    if (!anio) {
        anio = parseInt(fecha_pago.split('-')[0]);
    }

    const estudiante = db.prepare(` SELECT mensualidad FROM estudiantes WHERE id = ? `).get(estudiante_id);
    if (!estudiante) throw new Error('Estudiante no existe');

    const totalMensual = estudiante.mensualidad;

    // Buscar o crear registro mensual
    let mensual = db.prepare(`SELECT * FROM pagos_mensuales 
        WHERE estudiante_id = ? AND mes = ? AND anio = ?
    `).get(estudiante_id, mes, anio);

    if (!mensual) {
        db.prepare(`
            INSERT INTO pagos_mensuales
            (estudiante_id, mes, anio, total_mensual, total_pagado, estado)
            VALUES (?, ?, ?, ?, 0, 'pendiente')
        `).run(estudiante_id, mes, anio, totalMensual);

        mensual = db.prepare(`
            SELECT * FROM pagos_mensuales
            WHERE estudiante_id = ? AND mes = ? AND anio = ?
        `).get(estudiante_id, mes, anio);
    }

    // Calcular nuevo estado
    const nuevoTotal = mensual.total_pagado + monto;

    let estadoMensual = 'pendiente';
    if (nuevoTotal >= totalMensual) estadoMensual = 'completado';
    else if (nuevoTotal > 0) estadoMensual = 'abono';

    // Insertar pago
    const pago = db.prepare(`
        INSERT INTO pagos
        (estudiante_id, tipo_pago, mes, anio, monto, fecha_pago, metodo_pago, concepto, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        estudiante_id,
        tipo_pago,
        mes,
        anio,
        monto,
        fecha_pago,
        metodo_pago,
        concepto || '',
        estadoMensual === 'completado' ? 'completado' : 'pendiente'
    );

    // Actualizar mensual
    db.prepare(`
        UPDATE pagos_mensuales
        SET total_pagado = ?,
            estado = ?,
            ultimo_pago_id = ?,
            fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(nuevoTotal, estadoMensual, pago.lastInsertRowid, mensual.id);

    return { ok: true, pago_id: pago.lastInsertRowid, estado: estadoMensual };
}

// ✅ FUNCIÓN CORREGIDA: Calcular pendiente correctamente (nunca negativo)
function obtenerHistorialPagos(estudianteId, mes, anio) {
    // Obtener datos del estudiante
    const estudiante = db.prepare(`
        SELECT nombre, mensualidad 
        FROM estudiantes 
        WHERE id = ?
    `).get(estudianteId);

    if (!estudiante) {
        throw new Error('Estudiante no encontrado');
    }

    // Obtener estado mensual
    const pagoMensual = db.prepare(`
        SELECT total_pagado, estado, total_mensual
        FROM pagos_mensuales
        WHERE estudiante_id = ? AND mes = ? AND anio = ?
    `).get(estudianteId, mes, anio);

    // Obtener todos los pagos del mes
    const pagos = db.prepare(`
        SELECT 
            id,
            tipo_pago,
            monto,
            fecha_pago,
            metodo_pago,
            concepto,
            fecha_registro
        FROM pagos
        WHERE estudiante_id = ? AND mes = ? AND anio = ?
        ORDER BY fecha_registro ASC
    `).all(estudianteId, mes, anio);

    // Calcular pendiente: si se pagó de más o está completado, pendiente = 0
    let pendienteCalculado = 0;
    if (pagoMensual) {
        const diferencia = pagoMensual.total_mensual - pagoMensual.total_pagado;
        pendienteCalculado = diferencia > 0 ? diferencia : 0;
    } else {
        pendienteCalculado = estudiante.mensualidad;
    }

    return {
        estudiante: {
            id: estudianteId,
            nombre: estudiante.nombre,
            mensualidad: estudiante.mensualidad
        },
        resumen: {
            mes: mes,
            anio: anio,
            totalPagado: pagoMensual ? pagoMensual.total_pagado : 0,
            totalMensual: pagoMensual ? pagoMensual.total_mensual : estudiante.mensualidad,
            pendiente: pendienteCalculado,
            estado: pagoMensual ? pagoMensual.estado : 'pendiente'
        },
        pagos: pagos
    };
}

module.exports = { 
    listarPagosPorMes, 
    obtenerEstadisticasPorMes, 
    registrarPago,
    obtenerHistorialPagos 
};