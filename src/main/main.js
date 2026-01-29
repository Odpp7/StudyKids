const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

require('./database/scheme');
require('./ipc');

function createWindow() {
  const win = new BrowserWindow({
    icon: path.join(__dirname, '../assets/icon.ico'),
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload/preload.js'),
    }
  });

  win.loadFile(
    path.join(__dirname, '../renderer/index.html')
  );

  win.maximize();
  win.show();
}

app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
