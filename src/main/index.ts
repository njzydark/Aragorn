import { app, BrowserWindow, Tray, ipcMain } from 'electron';
import path from 'path';
import { handleUpload } from './upload';
import { Setting } from './setting';
import { History } from './history';
import { IWindowOptions } from 'types';

let tray: Tray;
let mainWindow: BrowserWindow;
let setting = new Setting();
let history = new History();

const isDev = process.env.NODE_ENV === 'development';

app.on('ready', () => {
  tray = new Tray(path.resolve(__dirname, '../assets/icon.png'));

  tray.addListener('click', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    } else {
      mainWindow.show();
    }
  });

  tray.addListener('drop-files', (_, files) => {
    handleUpload(mainWindow, setting, history, files);
  });

  ipcOnInit();
});

function createWindow(options: IWindowOptions = {}): BrowserWindow {
  let { url = '#/', openDevTools = isDev, width = 800, height = 600 } = options;
  const window = new BrowserWindow({
    width,
    height,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
      nodeIntegration: isDev
    }
  });

  if (isDev) {
    window.loadURL(`http://localhost:8081/${url}`);
    openDevTools && window.webContents.openDevTools();
  } else {
    window.loadFile(path.resolve(__dirname, './index.html'));
  }

  return window;
}

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

function ipcOnInit() {
  // 上传按钮事件
  ipcMain.on('image-upload', (_, files) => {
    handleUpload(mainWindow, setting, history, files);
  });

  // 获取基础设置
  ipcMain.on('setting-basic-get', event => {
    const basic = setting.getBasic();
    if (basic) {
      event.reply('setting-basic-get-replay', {
        type: 'get',
        data: basic
      });
    }
  });

  // 更新基础设置
  ipcMain.on('setting-basic-update', (event, basic) => {
    const updatedBasic = setting.updateBasic(basic);
    if (updatedBasic) {
      event.reply('setting-basic-update-replay', {
        type: 'update',
        data: updatedBasic
      });
    }
  });

  // 获取默认api信息
  ipcMain.on('setting-default-api-get', event => {
    const defaultApi = setting.getDefaultApi();
    if (defaultApi) {
      event.reply('setting-default-api-get-replay', {
        type: 'get',
        data: defaultApi
      });
    }
  });

  // 获取所有api信息
  ipcMain.on('setting-api-list-get', event => {
    const apiList = setting.getApiList();
    if (apiList) {
      event.reply('setting-api-list-get-replay', {
        type: 'get',
        data: apiList
      });
    }
  });

  // 添加API配置
  ipcMain.on('setting-api-add', (event, api) => {
    const apiList = setting.addApi(api);
    if (apiList) {
      event.reply('setting-api-list-get-replay', {
        type: 'get',
        data: apiList
      });
      event.reply('setting-api-add-replay', {
        type: 'add',
        data: api
      });
    }
  });

  // 获取API配置
  ipcMain.on('setting-api-get', (event, createTime) => {
    const api = setting.getApi(createTime);
    if (api) {
      event.reply('setting-api-get-replay', {
        type: 'get',
        data: api
      });
    }
  });

  // 更新API配置
  ipcMain.on('setting-api-update', (event, createTime) => {
    const apiList = setting.updateApi(createTime);
    if (apiList) {
      event.reply('setting-api-list-get-replay', {
        type: 'update',
        data: apiList
      });
      event.reply('setting-api-update-replay', {
        type: 'update'
      });
    }
  });

  // 删除API配置
  ipcMain.on('setting-api-delete', (event, createTime) => {
    const apiList = setting.deleteApi(createTime);
    if (apiList) {
      event.reply('setting-api-list-get-replay', {
        type: 'delete',
        data: apiList
      });
      event.reply('setting-api-delete-replay', {
        type: 'delete'
      });
    }
  });

  // 获取所有图片信息
  ipcMain.on('images-get', event => {
    const images = history.get();
    event.reply('images-get-replay', images);
  });
}
