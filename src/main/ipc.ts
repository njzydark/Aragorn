import { ipcMain, BrowserWindow } from 'electron';
import { Setting } from './setting';
import { History } from './history';
import { Upload } from './upload';

const setting = Setting.getInstance();
const history = History.getInstance();

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
      const defaultApi = setting.getDefaultApi();
      if (defaultApi) {
        event.reply('setting-default-api-get-replay', {
          type: 'get',
          data: defaultApi
        });
      }
    });

    ipcMain.on('setting-api-list-get', event => {
      const apiList = setting.getApiList();
      if (apiList) {
        event.reply('setting-api-list-get-replay', {
          type: 'get',
          data: apiList
        });
      }
    });

    ipcMain.on('setting-api-add', (event, api) => {
      const data = setting.addApi(api);
      if (data) {
        event.reply('setting-api-list-get-replay', {
          type: 'get',
          data: setting.userApiList
        });
        event.reply('setting-api-add-replay', {
          type: 'add',
          data
        });
      }
    });

    ipcMain.on('setting-api-get', (event, api) => {
      const data = setting.getApi(api);
      if (data) {
        event.reply('setting-api-get-replay', {
          type: 'get',
          data
        });
      }
    });

    ipcMain.on('setting-api-update', (event, api) => {
      const apiList = setting.updateApi(api);
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
      const apiList = setting.deleteApi(uuid);
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
      const defaultSdkList = setting.getDefaultSdkList();
      if (defaultSdkList) {
        event.reply('default-sdk-list-get-replay', {
          type: 'get',
          data: defaultSdkList
        });
      }
    });

    ipcMain.on('sdk-list-get', event => {
      const sdkList = setting.getSdkList();
      if (sdkList) {
        event.reply('sdk-list-get-replay', {
          type: 'get',
          data: sdkList
        });
      }
    });

    ipcMain.on('sdk-add', (event, sdk) => {
      const data = setting.addSdk(sdk);
      if (data) {
        event.reply('sdk-list-get-replay', {
          type: 'get',
          data: setting.userSdkList
        });
        event.reply('sdk-add-replay', {
          type: 'add',
          data
        });
      }
    });

    ipcMain.on('sdk-get', (event, sdk) => {
      const data = setting.getSdk(sdk);
      if (data) {
        event.reply('sdk-get-replay', {
          type: 'get',
          data
        });
      }
    });

    ipcMain.on('sdk-update', (event, sdk) => {
      const sdkList = setting.updateSdk(sdk);
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
      const sdkList = setting.deleteSdk(uuid);
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
