import { v4 as uuidv4 } from 'uuid';
import { uploaderProfilesStore } from './store';
import { UploaderOptions } from 'aragorn-types';

export interface UploaderProfile {
  id: string;
  name: string;
  uploaderName: string;
  uploaderOptions: UploaderOptions;
  isDefault?: boolean;
}

export class UploaderProfileManager {
  private static instance: UploaderProfileManager;

  static getInstance() {
    if (!UploaderProfileManager.instance) {
      UploaderProfileManager.instance = new UploaderProfileManager();
    }
    return UploaderProfileManager.instance;
  }

  protected uploaderProfiles: UploaderProfile[] = [];

  protected constructor() {
    this.uploaderProfiles = uploaderProfilesStore.get('uploaderProfiles', []) as UploaderProfile[];
  }

  getAll() {
    console.log('get all uploader profile');
    return this.uploaderProfiles;
  }

  add(uploaderProfile: UploaderProfile) {
    console.log(`add uploader profile: ${uploaderProfile.name}`);
    uploaderProfile.id = uuidv4();
    this.uploaderProfiles.push(uploaderProfile);
    this.save();
    return uploaderProfile;
  }

  get(uploaderProfile: UploaderProfile) {
    console.log(`get uploader profile: ${uploaderProfile.name}`);
    return this.uploaderProfiles.find(item => item.id === uploaderProfile.id);
  }

  update(uploaderProfile: UploaderProfile) {
    console.log(`update uploader profile: ${uploaderProfile.name}`);
    this.uploaderProfiles = this.uploaderProfiles.map(item => {
      if (item.id === uploaderProfile.id) {
        // eslint-disable-next-line no-param-reassign
        item = uploaderProfile;
      }
      return item;
    });
    this.save();
    return this.uploaderProfiles;
  }

  delete(id: string) {
    console.log(`delete uploader profile: ${id}`);
    this.uploaderProfiles = this.uploaderProfiles.filter(item => item.id !== id);
    this.save();
    return this.uploaderProfiles;
  }

  protected save() {
    uploaderProfilesStore.set('uploaderProfiles', this.uploaderProfiles);
  }
}
