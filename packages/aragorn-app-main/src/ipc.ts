import { ipcMain, BrowserWindow } from 'electron';
import { Updater } from './updater';
import { Setting } from './setting';
import { History } from './history';
import { UploaderManager } from './uploaderManager';
import { UploaderProfileManager, UploaderProfile } from './uploaderProfileManager';
import { AragornCore } from 'aragorn-core';

const updater = Updater.getInstance();
const setting = Setting.getInstance();
const history = History.getInstance();
const uploaderProfileManager = UploaderProfileManager.getInstance();
const core = new AragornCore();

export class Ipc {
  static win: BrowserWindow;

  private static instance: Ipc;

  static getInstance() {
    if (!Ipc.instance) {
      Ipc.instance = new Ipc();
    }
    return Ipc.instance;
  }

  static sendMessage(channel: string, channelData: any) {
    Ipc.win.webContents.send(channel, channelData);
  }

  init() {
    this.appUpdateHandlee();
    this.uploadHandle();
    this.settingHandle();
    this.uploaderHandle();
  }

  protected appUpdateHandlee() {
    ipcMain.on('check-update', () => {
      updater.checkUpdate();
    });
  }

  protected uploadHandle() {
    ipcMain.on('file-upload-by-side-menu', (_, filesPath: string[]) => {
      new UploaderManager().upload(filesPath);
    });

    ipcMain.on('uploaded-files-get', event => {
      const uploadedFiles = history.get();
      event.reply('uploaded-files-get-reply', uploadedFiles);
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

  protected uploaderHandle() {
    ipcMain.on('uploaders-get', event => {
      const uploaders = core.getAllUploaders();
      event.reply('uploaders-get-reply', uploaders);
    });

    ipcMain.on('uploader-profiles-get', event => {
      const uploaderProfiles = uploaderProfileManager.getAll();
      event.reply('uploader-profiles-get-reply', uploaderProfiles);
    });

    ipcMain.on('uploader-profile-add', (event, newUploaderProfile: UploaderProfile) => {
      const uploaderProfile = uploaderProfileManager.add(newUploaderProfile);
      if (uploaderProfile) {
        uploaderProfile.isDefault && setting.setDefaultUploaderProfile(uploaderProfile.id);
        event.reply('uploader-profiles-get-reply', uploaderProfileManager.getAll());
        event.reply('uploader-profile-add-reply', uploaderProfile);
        event.reply('setting-configuration-get-reply', setting.get());
      }
    });

    ipcMain.on('uploader-profile-update', (event, newUploaderProfile: UploaderProfile) => {
      const uploaderProfiles = uploaderProfileManager.update(newUploaderProfile);
      if (uploaderProfiles) {
        event.reply('uploader-profiles-get-reply', uploaderProfiles);
        event.reply('uploader-profile-update-reply', true);
      }
    });

    ipcMain.on('uploader-profile-delete', (event, id: string) => {
      const uploaderProfiles = uploaderProfileManager.delete(id);
      if (uploaderProfiles) {
        event.reply('uploader-profiles-get-reply', uploaderProfiles);
        event.reply('uploader-profile-delete-reply', true);
        setting.deleteDefaultUploaderProfile(id);
        event.reply('setting-configuration-get-reply', setting.get());
      }
    });
  }
}
