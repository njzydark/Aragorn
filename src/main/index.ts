import { app, BrowserWindow, Tray } from 'electron';
import path from 'path';
import { Ipc } from './ipc';
import { Upload } from './upload';

let tray: Tray;
let mainWindow: BrowserWindow;

const isDev = process.env.NODE_ENV === 'development';

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 950,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
      nodeIntegration: true
    }
  });

  if (isDev) {
    window.loadURL('http://localhost:8080');
  } else {
    window.loadFile(path.resolve(__dirname, '../renderer/index.html'));
  }

  return window;
}

app.on('ready', () => {
  tray = new Tray(path.resolve(__dirname, '../assets/icon.png'));

  tray.addListener('click', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    } else {
      mainWindow.show();
    }
  });

  // 托盘拖拽上传
  tray.addListener('drop-files', (_, files) => {
    new Upload(files, mainWindow).toUpload();
  });

  mainWindow = createWindow();

  Ipc.getInstance(mainWindow).init();
});

app.on('window-all-closed', function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow();
  }
});

app.allowRendererProcessReuse = true;
