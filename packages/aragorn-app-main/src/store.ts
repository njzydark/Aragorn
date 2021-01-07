import { app } from 'electron';
import ElectronStore from 'electron-store';
import { lte } from 'semver';
import path from 'path';
import fs from 'fs';
import { UploaderProfile } from './uploaderProfileManager';
import { UploaderConfig } from 'aragorn-types';

const isDev = process.env.NODE_ENV === 'development';

const devConfigDir = path.resolve(__dirname, '../../../../appDevConfig');

const cwd = isDev ? devConfigDir : app.getPath('userData');

export const historyStore = new ElectronStore({ name: 'history', cwd });

export const settingStore = new ElectronStore({ name: 'setting', cwd });

const uploaderProfilesStore = new ElectronStore({ name: 'uploaderProfiles', cwd });

// Upgrade configuration from the very first version
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

// Upgrade configuration from a version lower than 1.0.0
if (lte(app.getVersion(), '1.0.0')) {
  let uploaderProfiles = uploaderProfilesStore.get('uploaderProfiles', []) as UploaderProfile[];
  uploaderProfiles.map(item => {
    if (item.uploaderOptions) {
      item.config = item.uploaderOptions.reduce((pre, cur) => {
        pre[cur.name] = cur.value;
        return pre;
      }, {} as UploaderConfig);
      delete item.uploaderOptions;
    }
    return item;
  });
  uploaderProfilesStore.set('uploaderProfiles', uploaderProfiles);
}

export { uploaderProfilesStore };
