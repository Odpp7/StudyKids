const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Estudiantes
    crearEstudiante: (data) => ipcRenderer.invoke('estudiante:crear', data),
    listarEstudiantes: (turno) => ipcRenderer.invoke('estudiante:listar', turno),
    
    // Puedes agregar más funciones aquí según las necesites
});

console.log('✅ Preload cargado correctamente');