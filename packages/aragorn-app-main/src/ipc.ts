import { ipcMain, BrowserWindow } from 'electron';
import { AragornCore } from 'aragorn-core';
import { Updater } from './updater';
import { Setting } from './setting';
import { History } from './history';
import { UploaderManager } from './uploaderManager';
import { UploaderProfileManager, UploaderProfile } from './uploaderProfileManager';
import { WebServer } from './webServer';

export class Ipc {
  static win: BrowserWindow;

  private static instance: Ipc;

  static getInstance() {
    if (!Ipc.instance) {
      Ipc.instance = new Ipc();
    }
    return Ipc.instance;
  }

  static sendMessage(channel: string, channelData?: any) {
    Ipc.win.webContents.send(channel, channelData);
  }

  core: AragornCore;
  updater: Updater;
  setting: Setting;
  history: History;
  uploaderManager: UploaderManager;
  uploaderProfileManager: UploaderProfileManager;
  webServer: WebServer;

  protected constructor() {
    this.core = new AragornCore();

    this.updater = Updater.getInstance();
    this.setting = Setting.getInstance();
    this.history = History.getInstance();
    this.uploaderManager = UploaderManager.getInstance();
    this.uploaderProfileManager = UploaderProfileManager.getInstance();
    this.webServer = WebServer.getInstance();

    this.init();
  }

  protected init() {
    this.appUpdateHandlee();
    this.uploadHandle();
    this.settingHandle();
    this.uploaderProfileHandle();
    this.fileManageHandle();
  }

  protected appUpdateHandlee() {
    const { autoUpdate } = this.setting.get();
    if (autoUpdate) {
      this.updater.checkUpdate(false);
    }
    ipcMain.on('check-update', (_, manul = false) => {
      this.updater.checkUpdate(manul);
    });
  }

  protected uploadHandle() {
    ipcMain.on('file-upload-by-side-menu', (_, filesPath: string[]) => {
      this.uploaderManager.upload({ files: filesPath });
    });

    ipcMain.on('file-reupload', (_, data) => {
      this.uploaderManager.uploadByDifferentUploaderProfileIds(data);
    });

    ipcMain.on('uploaded-files-get', event => {
      const uploadedFiles = this.history.get();
      event.reply('uploaded-files-get-reply', uploadedFiles);
    });

    ipcMain.on('clear-upload-history', (event, ids: string[]) => {
      const uploadedFiles = this.history.clear(ids);
      event.reply('uploaded-files-get-reply', uploadedFiles);
    });
  }

  protected settingHandle() {
    ipcMain.on('setting-configuration-get', event => {
      const configuration = this.setting.get();
      event.reply('setting-configuration-get-reply', configuration);
    });

    ipcMain.on('setting-configuration-update', (event, newConfiguration) => {
      const configuration = this.setting.update(newConfiguration);
      if (configuration) {
        this.webServer.init();
        event.reply('setting-configuration-update-reply', configuration);
      }
    });

    ipcMain.on('set-default-uploader-profile', (event, id) => {
      const configuration = this.setting.setDefaultUploaderProfile(id);
      event.reply('setting-configuration-get-reply', configuration);
    });

    ipcMain.on('copy-darwin-workflow', event => {
      const res = this.setting.copyDarwinWorkflow();
      event.reply('copy-darwin-workflow-reply', res);
    });

    ipcMain.on('install-cli', async event => {
      const res = await this.setting.installCli();
      event.reply('install-cli-reply', res);
    });
  }

  protected uploaderProfileHandle() {
    ipcMain.on('uploaders-get', event => {
      const uploaders = this.core.getAllUploaders();
      event.reply('uploaders-get-reply', JSON.parse(JSON.stringify(uploaders)));
    });

    ipcMain.on('uploader-profiles-get', event => {
      const uploaderProfiles = this.uploaderProfileManager.getAll();
      event.reply('uploader-profiles-get-reply', uploaderProfiles);
    });

    ipcMain.on('uploader-profile-add', (event, newUploaderProfile: UploaderProfile) => {
      const uploaderProfile = this.uploaderProfileManager.add(newUploaderProfile);
      if (uploaderProfile) {
        this.setting.setDefaultUploaderProfile(uploaderProfile.id, uploaderProfile.isDefault);
        event.reply('uploader-profiles-get-reply', this.uploaderProfileManager.getAll());
        event.reply('uploader-profile-add-reply', uploaderProfile);
        event.reply('setting-configuration-get-reply', this.setting.get());
      }
    });

    ipcMain.on('uploader-profile-update', (event, newUploaderProfile: UploaderProfile) => {
      const uploaderProfiles = this.uploaderProfileManager.update(newUploaderProfile);
      if (uploaderProfiles) {
        this.setting.setDefaultUploaderProfile(newUploaderProfile.id, newUploaderProfile.isDefault);
        event.reply('uploader-profiles-get-reply', uploaderProfiles);
        event.reply('uploader-profile-update-reply', true);
        event.reply('setting-configuration-get-reply', this.setting.get());
      }
    });

    ipcMain.on('uploader-profile-delete', (event, id: string) => {
      const uploaderProfiles = this.uploaderProfileManager.delete(id);
      if (uploaderProfiles) {
        event.reply('uploader-profiles-get-reply', uploaderProfiles);
        event.reply('uploader-profile-delete-reply', true);
        this.setting.deleteDefaultUploaderProfile(id);
        event.reply('setting-configuration-get-reply', this.setting.get());
      }
    });
  }

  protected fileManageHandle() {
    ipcMain.on('file-list-get', (_, uploaderProfileId: string, directoryPath?: string) => {
      this.uploaderManager.getFileList(uploaderProfileId, directoryPath);
    });

    ipcMain.on('file-delete', (_, uploaderProfileId: string, fileNames: string[]) => {
      this.uploaderManager.deleteFile(uploaderProfileId, fileNames);
    });

    ipcMain.on('file-upload', (_, uploaderProfileId: string, filesPath: string[], directoryPath?: string) => {
      this.uploaderManager.upload({
        files: filesPath,
        customUploaderProfileId: uploaderProfileId,
        directoryPath,
        isFromFileManage: true
      });
    });

    ipcMain.on('directory-create', (_, uploaderProfileId: string, directoryPath: string) => {
      this.uploaderManager.createDirectory(uploaderProfileId, directoryPath);
    });

    ipcMain.on('file-download', (_, name: string, url: string) => {
      this.uploaderManager.download(name, url);
    });
  }
}
