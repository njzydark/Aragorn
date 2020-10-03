import { app, BrowserWindow } from 'electron';
import { Ipc } from './ipc';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

export class WindowManager {
  private static instance: WindowManager;

  static getInstance() {
    if (!WindowManager.instance) {
      WindowManager.instance = new WindowManager();
    }
    return WindowManager.instance;
  }

  mainWindow?: BrowserWindow;

  createWindow(): BrowserWindow {
    const window = new BrowserWindow({
      width: 950,
      height: 700,
      titleBarStyle: 'hidden',
      frame: false,
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

  showWindow() {
    app.dock.show();
    if (BrowserWindow.getAllWindows().length === 0) {
      this.mainWindow = this.createWindow();
      Ipc.win = this.mainWindow;
    } else {
      this.mainWindow?.show();
    }
  }

  handleSecondInstance() {
    if (this.mainWindow && BrowserWindow.getAllWindows().length !== 0) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.focus();
    }
  }
}
