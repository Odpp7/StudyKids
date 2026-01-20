const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Estudiantes
    crearEstudiante: (data) => ipcRenderer.invoke('estudiante:crear', data),
    listarEstudiantes: (turno) => ipcRenderer.invoke('estudiante:listar', turno),
    obtenerEstadisticasEstudiantes: (turno) => ipcRenderer.invoke('estudiante:estadisticas', turno),
    obtenerEstudiantePorId: (id) => ipcRenderer.invoke('estudiante:obtenerPorId', id),
    actualizarEstudiante: (id, estudiante) => ipcRenderer.invoke('estudiante:actualizar', {id, estudiante}),
    eliminarEstudiante: (id) => ipcRenderer.invoke('estudiante:eliminar', id),
});

console.log('✅ Preload cargado correctamente');