const db = require('./connection');

db.exec(`
  CREATE TABLE IF NOT EXISTS estudiantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    turno TEXT NOT NULL CHECK(turno IN ('manana', 'tarde')),
    nombre TEXT NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    edad INTEGER,
    direccion TEXT,
    colegio TEXT,
    grado TEXT NOT NULL,
    mensualidad REAL NOT NULL,
    fecha_inicio DATE NOT NULL,
    estado_pago TEXT DEFAULT 'al-dia' CHECK(estado_pago IN ('al-dia', 'pendiente')),
    observacion TEXT,
    activo INTEGER DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS acudientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estudiante_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    email TEXT,
    relacion TEXT DEFAULT 'madre'
      CHECK(relacion IN ('madre','padre','abuela','abuelo','tia','tio','otro')),
    es_principal INTEGER DEFAULT 0,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS pagos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estudiante_id INTEGER NOT NULL,
    mes INTEGER NOT NULL CHECK(mes BETWEEN 1 AND 12),
    anio INTEGER NOT NULL,
    monto REAL NOT NULL,
    fecha_pago DATE,
    metodo_pago TEXT,
    referencia TEXT,
    estado TEXT DEFAULT 'pendiente',
    monto_pagado REAL DEFAULT 0,
    notas TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
    UNIQUE(estudiante_id, mes, anio)
  );

  CREATE TABLE IF NOT EXISTS actividades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    tipo TEXT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    descripcion TEXT,
    ubicacion TEXT,
    color TEXT DEFAULT '#667eea',
    repetir INTEGER DEFAULT 0,
    completado INTEGER DEFAULT 0,
    recordatorio INTEGER DEFAULT 0,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('Tablas creadas correctamente');
