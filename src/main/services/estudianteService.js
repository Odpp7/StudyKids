const db = require('../database/connection');

function crearEstudiante(estudiante) {
    const sql = db.prepare(`INSERT INTO estudiantes (
      turno, nombre, fecha_nacimiento, edad,
      direccion, colegio, grado,
      mensualidad, fecha_inicio, estado_pago, observacion
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    const values = sql.run(
        estudiante.turno,
        estudiante.nombre,
        estudiante.fecha_nacimiento,
        estudiante.edad,
        estudiante.direccion,
        estudiante.colegio || null,
        estudiante.grado,
        estudiante.mensualidad,
        estudiante.fecha_inicio,
        estudiante.estado_pago || 'al-dia',
        estudiante.observacion || null
    );

    return values.lastInsertRowid;
}

function crearEstudianteConAcudiente({ estudiante, acudiente }) {
    const estudianteId = crearEstudiante(estudiante);

    const sqlAcu = db.prepare(`
    INSERT INTO acudientes (
      nombre, telefono, email, relacion, estudiante_id, es_principal
    ) VALUES (?, ?, ?, ?, ?, 1)
  `);

    sqlAcu.run(
        acudiente.nombre,
        acudiente.telefono,
        acudiente.email,
        acudiente.relacion,
        estudianteId
    );

    return { ok: true };
}


function listarPorTurno(turno) {
    const sql = db.prepare(`
    SELECT 
      e.*,
      a.nombre AS acudiente_nombre,
      a.telefono AS acudiente_telefono,
      a.email AS acudiente_email,
      a.relacion AS acudiente_relacion
    FROM estudiantes e
    LEFT JOIN acudientes a 
      ON a.estudiante_id = e.id
      AND a.es_principal = 1
    WHERE e.turno = ?
      AND e.activo = 1
  `);

    return sql.all(turno);
}

function ObtenerEstadisticas(turno) {
    const total = db.prepare(`
        SELECT COUNT(*) AS total
        FROM estudiantes
        WHERE turno = ? AND activo = 1
    `)

    const alDia = db.prepare(`
      SELECT COUNT(*) as total
      FROM estudiantes
      WHERE turno = ? AND activo = 1 AND estado_pago = 'al-dia'
    `).get(turno).total;

    return { total: total.get(turno).total, alDia };
}

function ObtenerEstudiantePorId(id) {
    const sql = db.prepare(`
        SELECT 
            e.*,
            a.id AS acudiente_id,
            a.nombre AS acudiente_nombre,
            a.telefono AS acudiente_telefono,
            a.email AS acudiente_email,
            a.relacion AS acudiente_relacion
        FROM estudiantes e
        LEFT JOIN acudientes a 
            ON a.estudiante_id = e.id
            AND a.es_principal = 1
        WHERE e.id = ?
    `);

    return sql.get(id);
}


function ActualizarEstudiante(id, estudiante) {
    const sql = db.prepare(`
        UPDATE estudiantes SET
            turno = ?,
            nombre = ?,
            fecha_nacimiento = ?,
            edad = ?,
            direccion = ?,
            colegio = ?,
            grado = ?,
            mensualidad = ?,
            fecha_inicio = ?,
            estado_pago = ?,
            observacion = ?
        WHERE id = ?
    `);

    sql.run(
        estudiante.turno,
        estudiante.nombre,
        estudiante.fecha_nacimiento,
        estudiante.edad,
        estudiante.direccion,
        estudiante.colegio || null,
        estudiante.grado || null,
        estudiante.mensualidad || null,
        estudiante.fecha_inicio || null,
        estudiante.estado_pago || 'al-dia',
        estudiante.observacion || null,
        id
    );

    return { ok: true };
}
function EliminarEstudiante(id) {
    const sql = db.prepare(`UPDATE estudiantes SET activo = 0 WHERE id = ?`);
    sql.run(id);
    return { ok: true };
}

module.exports = { 
    crearEstudiante, 
    listarPorTurno, 
    crearEstudianteConAcudiente, 
    ObtenerEstudiantePorId,
    ObtenerEstadisticas,
    ActualizarEstudiante, 
    EliminarEstudiante 
};