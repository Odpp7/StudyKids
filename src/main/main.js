const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

require('./database/scheme');
require('./ipc');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '../assets/icon.ico'),
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload/preload.js'),
    }
  });

  mainWindow.loadFile(
    path.join(__dirname, '../renderer/index.html')
  );

  mainWindow.maximize();
  mainWindow.show();
}

// Configuración del auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Eventos del updater
autoUpdater.on('checking-for-update', () => {
  console.log('Verificando actualizaciones...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Actualización disponible:', info.version);
  
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Actualización disponible',
    message: `Hay una nueva versión disponible: ${info.version}`,
    buttons: ['Descargar', 'Más tarde']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.downloadUpdate();
    }
  });
});

autoUpdater.on('update-not-available', () => {
  console.log('No hay actualizaciones disponibles');
});

autoUpdater.on('download-progress', (progressObj) => {
  let mensaje = `Descargando: ${Math.round(progressObj.percent)}%`;
  console.log(mensaje);
  mainWindow.setProgressBar(progressObj.percent / 100);
});

autoUpdater.on('update-downloaded', () => {
  console.log('Actualización descargada');
  mainWindow.setProgressBar(-1);
  
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Actualización lista',
    message: 'La actualización se ha descargado. La aplicación se reiniciará para instalarla.',
    buttons: ['Reiniciar ahora', 'Más tarde']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('error', (error) => {
  console.error('Error en actualización:', error);
});

app.whenReady().then(() => {
  createWindow();
  
  // Verificar actualizaciones después de 3 segundos
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 3000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});