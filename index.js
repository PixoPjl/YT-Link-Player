const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

const iconPath = path.join(__dirname, 'favicon.ico');

let tray = null;

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    width: 350,
    height: 200,
    icon: iconPath,
    autoHideMenuBar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadFile('index.html');
  
  tray = new Tray(iconPath);
  tray.setToolTip('Made by @Pixo');
  
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
  
  const trayMenu = Menu.buildFromTemplate([
    {
      label: 'Sair',
      type: 'normal',
      click: () => {
        app.quit();
      },
    },
  ]);
  
  mainWindow.on('minimize', () => {
    mainWindow.hide();
  });
  
  tray.setContextMenu(trayMenu);
});