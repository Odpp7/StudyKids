const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Estudiantes
    crearEstudiante: (data) => ipcRenderer.invoke('estudiante:crear', data),
    listarEstudiantes: (turno) => ipcRenderer.invoke('estudiante:listar', turno),
    obtenerEstadisticasEstudiantes: (turno) => ipcRenderer.invoke('estudiante:estadisticas', turno),
    obtenerEstudiantePorId: (id) => ipcRenderer.invoke('estudiante:obtenerPorId', id),
    actualizarEstudiante: (id, estudiante) => ipcRenderer.invoke('estudiante:actualizar', {id, estudiante}),
    eliminarEstudiante: (id) => ipcRenderer.invoke('estudiante:eliminar', id),

    // Pagos
    listarEstudiantesParaPagos: (turno) => ipcRenderer.invoke('pago:listar', turno),
    listarPagosPorMes: (turno, mes, anio) => ipcRenderer.invoke('pago:listarPorMes', { turno, mes, anio }),
    registrarPago: (data) => ipcRenderer.invoke('pago:registrar', data),
    
});