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

  -- HISTORIAL COMPLETO DE MOVIMIENTOS (AGREGADA COLUMNA MES Y ANIO)
  CREATE TABLE IF NOT EXISTS pagos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estudiante_id INTEGER NOT NULL,
    tipo_pago TEXT NOT NULL CHECK(tipo_pago IN ('abono', 'pago-mes', 'adelantado')),
    mes TEXT NOT NULL,
    anio INTEGER NOT NULL,
    monto REAL NOT NULL,
    fecha_pago DATE NOT NULL,
    metodo_pago TEXT NOT NULL CHECK(metodo_pago IN ('efectivo', 'transferencia', 'daviplata', 'nequi', 'tarjeta')),
    concepto TEXT,
    estado TEXT DEFAULT 'registrado' CHECK(estado IN ('registrado', 'anulado', 'completado', 'pendiente')),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE
  );

  -- ESTADO POR MES (LO QUE VE TU MAMÁ)
  CREATE TABLE IF NOT EXISTS pagos_mensuales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estudiante_id INTEGER NOT NULL,
    mes TEXT NOT NULL,
    anio INTEGER NOT NULL,
    total_mensual REAL NOT NULL,
    total_pagado REAL NOT NULL DEFAULT 0,
    estado TEXT NOT NULL CHECK(estado IN ('pendiente','abono','completado')),
    ultimo_pago_id INTEGER,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(estudiante_id, mes, anio),
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
    FOREIGN KEY (ultimo_pago_id) REFERENCES pagos(id)
  );

  CREATE INDEX IF NOT EXISTS idx_pagos_estudiante ON pagos(estudiante_id);
  CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);
  CREATE INDEX IF NOT EXISTS idx_pagos_mes_anio ON pagos(mes, anio);

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