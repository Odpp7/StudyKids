const { ipcMain } = require('electron');
const estudiantesService = require('./services/estudianteService');
const pagosService = require('./services/pagosService');
const facturaService = require('./services/facturaService');

// ===================== ESTUDIANTES =====================

ipcMain.handle('estudiante:crear', (_, data) => {
    return estudiantesService.crearEstudianteConAcudiente(data);
});

ipcMain.handle('estudiante:listar', (_, turno) => {
    return estudiantesService.listarPorTurno(turno);
});

ipcMain.handle('estudiante:estadisticas', (_, turno) => {
    return estudiantesService.ObtenerEstadisticas(turno);
});

ipcMain.handle('estudiante:obtenerPorId', (_, id) => {
    return estudiantesService.ObtenerEstudiantePorId(id);
});

ipcMain.handle('estudiante:actualizar', (_, {id, estudiante}) => {
    return estudiantesService.ActualizarEstudiante(id, estudiante);
});

ipcMain.handle('estudiante:eliminar', (_, id) => {
    return estudiantesService.EliminarEstudiante(id);
});

ipcMain.handle('estudiante:obtenerAcudientes', (_, estudianteId) => {
    return estudiantesService.obtenerAcudientesPorEstudiante(estudianteId);
});


// ===================== PAGOS =====================

ipcMain.handle('pago:listarPorMes', (_, { turno, mes, anio }) => {
    return pagosService.listarPagosPorMes(turno, mes, anio);
});

ipcMain.handle('pago:registrar', (_, data) => {
    return pagosService.registrarPago(data);
});

ipcMain.handle('obtener-estadisticas-pagos', (_, turno, mes, anio) => {
    return pagosService.obtenerEstadisticasPorMes(turno, mes, anio);
});

ipcMain.handle('obtener-historial-pagos',(_,estudianteId, mes, anio) => {
    return pagosService.obtenerHistorialPagos(estudianteId, mes, anio);
});

// ===================== PAGOS =====================

ipcMain.handle('factura:generar', (_,{estudianteId, mes, anio}) => {
    return facturaService.generarFacturaPago(estudianteId, mes, anio);
});

