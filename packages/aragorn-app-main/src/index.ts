import { config as dotenvConfig } from 'dotenv';
import { app } from 'electron';
import reloader from 'electron-reloader';
import { Logger } from './logger';
import { Tray } from './tray';
import { WindowManager } from './windowManager';
import { WebServer } from './webServer';
import { Setting } from './setting';
import { Ipc } from './ipc';

try {
  module.filename = __filename;
  reloader(module, {
    watchRenderer: false
  });
} catch (err) {
  console.error(err);
}

Logger.getInstance().init();

dotenvConfig({ path: '../../.env' });

const gotTheLock = app.requestSingleInstanceLock();

const windowManager = WindowManager.getInstance();

if (gotTheLock) {
  app.on('ready', () => {
    console.log('app ready');
    Ipc.getInstance();
    Tray.getInstance().init();
    windowManager.showWindow();
    Setting.getInstance().registerUploadShortcutKey();
    WebServer.getInstance().init();
  });
  app.on('window-all-closed', function () {
    console.log('app all window closed');
    app?.dock?.hide();
  });
  app.on('activate', () => {
    console.log('app activate');
    windowManager.showWindow();
  });
  app.on('second-instance', () => {
    console.warn('app second instance emit');
    windowManager.handleSecondInstance();
  });
} else {
  app.quit();
}
