import { ipcMain, BrowserWindow } from 'electron';
import { Setting } from './setting';
import { History } from './history';
import { Api } from './api';
import { Sdk } from './sdk';
import { Upload } from './upload';

const setting = Setting.getInstance();
const history = History.getInstance();
const api = Api.getInstance();
const sdk = Sdk.getInstance();

export class Ipc {
  private static instance: Ipc;
  static win: BrowserWindow;

  static getInstance() {
    if (!Ipc.instance) {
      Ipc.instance = new Ipc();
    }
    return Ipc.instance;
  }

  init() {
    // 上传按钮事件
    ipcMain.on('image-upload', (_, files) => {
      Upload.win = Ipc.win;
      new Upload(files).toUpload();
    });

    // 获取基础设置
    ipcMain.on('setting-basic-get', event => {
      const configuration = setting.get();
      if (configuration) {
        event.reply('setting-basic-get-replay', {
          type: 'get',
          data: configuration
        });
      }
    });

    // 更新基础设置
    ipcMain.on('setting-basic-update', (event, configuration) => {
      const updatedConfiguration = setting.update(configuration);
      if (updatedConfiguration) {
        event.reply('setting-basic-update-replay', {
          type: 'update',
          data: updatedConfiguration
        });
      }
    });

    // 获取所有图片信息
    ipcMain.on('images-get', event => {
      const images = history.get();
      event.reply('images-get-replay', images);
    });

    this.handleCustomApiHandle();
    this.handleSdkHandle();
  }

  protected handleCustomApiHandle() {
    ipcMain.on('setting-default-api-get', event => {
      const defaultApi = api.getDefault();
      if (defaultApi) {
        event.reply('setting-default-api-get-replay', {
          type: 'get',
          data: defaultApi
        });
      }
    });

    ipcMain.on('setting-api-list-get', event => {
      const apiList = api.getList();
      if (apiList) {
        event.reply('setting-api-list-get-replay', {
          type: 'get',
          data: apiList
        });
      }
    });

    ipcMain.on('setting-api-add', (event, arg) => {
      const data = api.add(arg);
      if (data) {
        event.reply('setting-api-list-get-replay', {
          type: 'get',
          data: api.userApiList
        });
        event.reply('setting-api-add-replay', {
          type: 'add',
          data
        });
      }
    });

    ipcMain.on('setting-api-get', (event, arg) => {
      const data = api.get(arg);
      if (data) {
        event.reply('setting-api-get-replay', {
          type: 'get',
          data
        });
      }
    });

    ipcMain.on('setting-api-update', (event, arg) => {
      const apiList = api.update(arg);
      if (apiList) {
        event.reply('setting-api-list-get-replay', {
          type: 'get',
          data: apiList
        });
        event.reply('setting-api-update-replay', {
          type: 'update'
        });
      }
    });

    ipcMain.on('setting-api-delete', (event, uuid: string) => {
      const apiList = api.delete(uuid);
      if (apiList) {
        event.reply('setting-api-list-get-replay', {
          type: 'get',
          data: apiList
        });
        event.reply('setting-api-delete-replay', {
          type: 'delete'
        });
      }
    });
  }

  protected handleSdkHandle() {
    ipcMain.on('default-sdk-list-get', event => {
      const defaultSdkList = sdk.getSdks();
      if (defaultSdkList) {
        event.reply('default-sdk-list-get-replay', {
          type: 'get',
          data: defaultSdkList
        });
      }
    });

    ipcMain.on('sdk-list-get', event => {
      const sdkList = sdk.getList();
      if (sdkList) {
        event.reply('sdk-list-get-replay', {
          type: 'get',
          data: sdkList
        });
      }
    });

    ipcMain.on('sdk-add', (event, arg) => {
      const data = sdk.add(arg);
      if (data) {
        event.reply('sdk-list-get-replay', {
          type: 'get',
          data: sdk.userSdkList
        });
        event.reply('sdk-add-replay', {
          type: 'add',
          data
        });
      }
    });

    ipcMain.on('sdk-get', (event, arg) => {
      const data = sdk.get(arg);
      if (data) {
        event.reply('sdk-get-replay', {
          type: 'get',
          data
        });
      }
    });

    ipcMain.on('sdk-update', (event, arg) => {
      const sdkList = sdk.update(arg);
      if (sdkList) {
        event.reply('sdk-list-get-replay', {
          type: 'get',
          data: sdkList
        });
        event.reply('sdk-update-replay', {
          type: 'update'
        });
      }
    });

    ipcMain.on('sdk-delete', (event, uuid: string) => {
      const sdkList = sdk.delete(uuid);
      if (sdkList) {
        event.reply('sdk-list-get-replay', {
          type: 'get',
          data: sdkList
        });
        event.reply('sdk-delete-replay', {
          type: 'delete'
        });
      }
    });
  }
}
