import { app, Menu, MenuItemConstructorOptions, Tray as ElectronTray, dialog } from 'electron';
import path from 'path';
import { WindowManager } from './windowManager';
import { Setting, SettingConfiguration } from './setting';
import { Updater } from './updater';
import { UploaderManager } from './uploaderManager';
import { UploaderProfileManager } from './uploaderProfileManager';
import { Ipc } from './ipc';

export class Tray {
  private static instance: Tray;

  static getInstance() {
    if (!Tray.instance) {
      Tray.instance = new Tray();
    }
    return Tray.instance;
  }

  tray: ElectronTray;
  windowManager: WindowManager;
  uploadManager: UploaderManager;
  uploaderProfileManager: UploaderProfileManager;
  setting: Setting;
  updater: Updater;

  constructor() {
    this.tray = new ElectronTray(path.resolve(__dirname, '../assets/trayIconTemplate.png'));
    this.windowManager = WindowManager.getInstance();
    this.uploadManager = UploaderManager.getInstance();
    this.uploaderProfileManager = UploaderProfileManager.getInstance();
    this.setting = Setting.getInstance();
    this.updater = Updater.getInstance();
  }

  init() {
    this.tray.addListener('right-click', () => {
      const contextMenu = this.getContextMenu();
      this.tray.popUpContextMenu(contextMenu);
    });

    this.tray.addListener('click', () => {
      this.windowManager.showWindow();
    });

    // 托盘拖拽上传
    this.tray.addListener('drop-files', (_, files) => {
      this.uploadManager.upload({ files });
    });
  }

  protected getContextMenu(): Menu {
    const {
      configuration: { urlType, defaultUploaderProfileId }
    } = this.setting;

    const separatorTemplate: MenuItemConstructorOptions = {
      type: 'separator'
    };

    const generalTemplate: MenuItemConstructorOptions[] = [
      {
        label: '控制台',
        click: () => {
          this.windowManager.showWindow();
        }
      },
      {
        label: '手动上传',
        click: () => {
          this.windowManager.showWindow();
          if (this.windowManager.mainWindow) {
            dialog
              .showOpenDialog(this.windowManager.mainWindow, {
                properties: ['openFile', 'multiSelections'],
                buttonLabel: '确认'
              })
              .then(res => {
                if (!res.canceled && res.filePaths.length > 0) {
                  this.uploadManager.upload({ files: res.filePaths });
                }
              });
          }
        }
      },
      separatorTemplate
    ];

    const urlTemplate = (['URL', 'HTML', 'Markdown'] as SettingConfiguration['urlType'][])
      .map(
        item =>
          ({
            label: item,
            type: 'radio',
            checked: urlType === item,
            click: () => {
              this.setting.setUrlType(item);
              Ipc.sendMessage('setting-configuration-get-reply', this.setting.configuration);
            }
          } as MenuItemConstructorOptions)
      )
      .concat(separatorTemplate);

    const profileTemplate = UploaderProfileManager.getInstance()
      .getAll()
      .map(
        item =>
          ({
            label: item.name,
            type: 'checkbox',
            checked: item.id === defaultUploaderProfileId,
            click: () => {
              this.setting.setDefaultUploaderProfile(item.id);
              Ipc.sendMessage('setting-configuration-get-reply', this.setting.configuration);
            }
          } as MenuItemConstructorOptions)
      );

    profileTemplate.length > 0 && profileTemplate.push(separatorTemplate);

    const otherTemplate: MenuItemConstructorOptions[] = [
      {
        label: '检查更新',
        click: () => {
          this.updater.checkUpdate(true, true);
        }
      },
      {
        label: '退出',
        click: () => {
          app.exit();
        }
      }
    ];

    const template: MenuItemConstructorOptions[] = [
      ...generalTemplate,
      ...urlTemplate,
      ...profileTemplate,
      ...otherTemplate
    ];

    return Menu.buildFromTemplate(template);
  }
}
