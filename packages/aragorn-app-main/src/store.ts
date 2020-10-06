import { app } from 'electron';
import ElectronStore from 'electron-store';
import path from 'path';
import fs from 'fs';

const isDev = process.env.NODE_ENV === 'development';

const devConfigDir = path.resolve(__dirname, '../../../../appDevConfig');

const cwd = isDev ? devConfigDir : app.getPath('userData');

export const historyStore = new ElectronStore({ name: 'history', cwd });

export const settingStore = new ElectronStore({ name: 'setting', cwd });

export const uploaderProfilesStore = new ElectronStore({ name: 'uploaderProfiles', cwd });

if (fs.existsSync(`${cwd}/config.json`)) {
  let oldVersionUploaderProfiles = [] as any;

  const oldStore = new ElectronStore({ name: 'config', cwd });

  const userSdkList = oldStore.get('userSdkList', []) as any[];

  oldVersionUploaderProfiles = userSdkList.map(item => {
    const newItem = {} as any;
    newItem.id = item.uuid;
    newItem.name = item.name;
    newItem.uploaderName = item.sdkName;
    newItem.uploaderOptions = item.configurationList;
    return newItem;
  });

  uploaderProfilesStore.set('uploaderProfiles', oldVersionUploaderProfiles);

  fs.unlinkSync(`${cwd}/config.json`);
}
