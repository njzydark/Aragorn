import { UploadedFileInfo } from 'types';
import store from './store';

export class History {
  private static instance: History;
  uploadedFiles: UploadedFileInfo[];

  private constructor() {
    this.uploadedFiles = store.get('uploadedFiles', []);
  }

  static getInstance() {
    if (!History.instance) {
      History.instance = new History();
    }
    return History.instance;
  }

  add(uploadedFile: UploadedFileInfo) {
    this.uploadedFiles.unshift(uploadedFile);
    store.set('uploadedFiles', this.uploadedFiles);
    return this.uploadedFiles;
  }

  get() {
    return this.uploadedFiles;
  }
}
