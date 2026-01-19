const db = require('../database/connection');

function crearEstudiante(estudiante) {
    const sql = db.prepare(`INSERT INTO estudiantes (
      turno, nombre, fecha_nacimiento, edad,
      direccion, colegio, grado,
      mensualidad, fecha_inicio, observacion
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

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
        estudiante.observacion || null
    );

    return values.lastInsertRowid;
}

function listarPorTurno(turno) {
    const sql = db.prepare('SELECT * FROM estudiantes WHERE turno = ? AND activo = 1');
    return sql.all(turno);
}

module.exports = { crearEstudiante, listarPorTurno };