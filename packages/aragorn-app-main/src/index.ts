import { config as dotenvConfig } from 'dotenv';
import { app } from 'electron';
import { Tray } from './tray';
import { WindowManager } from './windowManager';
import { WebServer } from './webServer';
import { Ipc } from './ipc';

dotenvConfig({ path: '../../.env' });

const gotTheLock = app.requestSingleInstanceLock();

const windowManager = WindowManager.getInstance();

if (gotTheLock) {
  app.on('ready', () => {
    Ipc.getInstance();

    Tray.getInstance().init();

    windowManager.showWindow();

    WebServer.getInstance().init();
  });

  app.on('window-all-closed', function () {
    app?.dock?.hide();
  });

  app.on('activate', () => {
    windowManager.showWindow();
  });

  app.on('second-instance', () => {
    windowManager.handleSecondInstance();
  });
} else {
  app.quit();
}
