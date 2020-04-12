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
    this.uploadHandle();
    this.settingHandle();
    this.apiHandle();
    this.sdkHandle();
  }

  protected uploadHandle() {
    ipcMain.on('file-upload-by-side-menu', (_, filesPath: string[]) => {
      Upload.win = Ipc.win;
      new Upload(filesPath).toUpload();
    });

    ipcMain.on('uploaded-images-get', event => {
      const images = history.get();
      event.reply('uploaded-images-get-reply', images);
    });
  }

  protected settingHandle() {
    ipcMain.on('setting-configuration-get', event => {
      const configuration = setting.get();
      event.reply('setting-configuration-get-reply', configuration);
    });

    ipcMain.on('setting-configuration-update', (event, newConfiguration) => {
      const configuration = setting.update(newConfiguration);
      if (configuration) {
        event.reply('setting-configuration-update-reply', configuration);
      }
    });
  }

  protected apiHandle() {
    ipcMain.on('default-api-get', event => {
      const defaultApi = api.getDefault();
      if (defaultApi) {
        event.reply('default-api-get-reply', defaultApi);
      }
    });

    ipcMain.on('user-api-list-get', event => {
      const userApiList = api.getList();
      if (userApiList) {
        event.reply('user-api-list-get-reply', userApiList);
      }
    });

    ipcMain.on('api-add', (event, newApi) => {
      const addedApi = api.add(newApi);
      if (addedApi) {
        event.reply('user-api-list-get-reply', api.userApiList);
        event.reply('api-add-reply', addedApi);
      }
    });

    ipcMain.on('api-update', (event, newApi) => {
      const userApiList = api.update(newApi);
      if (userApiList) {
        event.reply('user-api-list-get-reply', userApiList);
        event.reply('api-update-reply', true);
      }
    });

    ipcMain.on('api-delete', (event, uuid: string) => {
      const userApiList = api.delete(uuid);
      if (userApiList) {
        event.reply('user-api-list-get-reply', userApiList);
        event.reply('api-delete-reply', true);
      }
    });
  }

  protected sdkHandle() {
    ipcMain.on('sdks-get', event => {
      const sdks = sdk.getSdks();
      if (sdks) {
        event.reply('sdks-get-reply', sdks);
      }
    });

    ipcMain.on('user-sdk-list-get', event => {
      const userSdkList = sdk.getList();
      if (userSdkList) {
        event.reply('user-sdk-list-get-reply', userSdkList);
      }
    });

    ipcMain.on('sdk-add', (event, newSdk) => {
      const addedSdk = sdk.add(newSdk);
      if (addedSdk) {
        event.reply('user-sdk-list-get-reply', sdk.userSdkList);
        event.reply('sdk-add-reply', addedSdk);
      }
    });

    ipcMain.on('sdk-update', (event, newSdk) => {
      const userSdkList = sdk.update(newSdk);
      if (userSdkList) {
        event.reply('user-sdk-list-get-reply', userSdkList);
        event.reply('sdk-update-reply', true);
      }
    });

    ipcMain.on('sdk-delete', (event, uuid: string) => {
      const userSdkList = sdk.delete(uuid);
      if (userSdkList) {
        event.reply('user-sdk-list-get-reply', userSdkList);
        event.reply('sdk-delete-reply', true);
      }
    });
  }
}
