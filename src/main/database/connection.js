const { app } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ruta segura del sistema
const userDataPath = app.getPath('userData');

// Asegurar que la carpeta exista
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

// Ruta final de la base de datos
const dbPath = path.join(userDataPath, 'studykids.db');

// Crear / abrir base de datos
const db = new Database(dbPath);

console.log('Base de datos conectada en:', dbPath);

module.exports = db;
