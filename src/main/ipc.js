const { ipcMain } = require('electron');
const estudiantesService = require('./services/estudianteService');

/* Guardar estudiante */
ipcMain.handle('estudiante:crear', (_, data) => {
    return estudiantesService.crearEstudiante(data);
});

/* Obtener estudiantes por turno */
ipcMain.handle('estudiante:listar', (_, turno) => {
    return estudiantesService.listarPorTurno(turno);
});
