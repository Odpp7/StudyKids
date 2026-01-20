const { ipcMain } = require('electron');
const estudiantesService = require('./services/estudianteService');

/* Guardar estudiante y acudiente */
ipcMain.handle('estudiante:crear', (_, data) => {
    return estudiantesService.crearEstudianteConAcudiente(data);
});

/* Obtener estudiantes por turno */
ipcMain.handle('estudiante:listar', (_, turno) => {
    return estudiantesService.listarPorTurno(turno);
});

/* Obtener estadísticas de estudiantes por turno */
ipcMain.handle('estudiante:estadisticas', (_, turno) => {
    return estudiantesService.ObtenerEstadisticas(turno);
});

/*Obtener estudiante por ID*/
ipcMain.handle('estudiante:obtenerPorId', (_, id) => {
    return estudiantesService.ObtenerEstudiantePorId(id);
});

/* Actualizar estudiante */
ipcMain.handle('estudiante:actualizar', (_, {id, estudiante}) => {
    return estudiantesService.ActualizarEstudiante(id, estudiante);
});

/* Eliminar estudiante */
ipcMain.handle('estudiante:eliminar', (_, id) => {
    return estudiantesService.EliminarEstudiante(id);
});