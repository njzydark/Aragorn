import { config as dotenvConfig } from 'dotenv';
import { app, BrowserWindow, Tray } from 'electron';
import path from 'path';
import { Ipc } from './ipc';
import { UploaderManager } from './uploaderManager';
import { WebServer } from './webServer';

let tray: Tray;
let mainWindow: BrowserWindow;

dotenvConfig({ path: '../../.env' });

const isDev = process.env.NODE_ENV === 'development';

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow && BrowserWindow.getAllWindows().length !== 0) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  app.on('ready', () => {
    tray = new Tray(path.resolve(__dirname, '../assets/trayIconTemplate.png'));

    tray.addListener('click', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createWindow();
        Ipc.win = mainWindow;
      } else {
        mainWindow.show();
      }
    });

    // 托盘拖拽上传
    tray.addListener('drop-files', (_, files) => {
      UploaderManager.getInstance().upload({ files });
    });

    mainWindow = createWindow();
    Ipc.win = mainWindow;
    Ipc.getInstance();

    WebServer.getInstance().init();
  });

  app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
      Ipc.win = mainWindow;
    }
  });
}

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 950,
    height: 700,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true
    }
  });

  if (isDev) {
    window.loadURL(`http://localhost:${process.env.RENDERER_DEV_PORT}`);
  } else {
    window.loadFile(path.resolve(__dirname, '../renderer/index.html'));
  }

  return window;
}
