import store from './store';
import { UploadedFileInfo } from './upload';

export class History {
  private static instance: History;

  static getInstance() {
    if (!History.instance) {
      History.instance = new History();
    }
    return History.instance;
  }

  uploadedFiles: UploadedFileInfo[];

  private constructor() {
    this.uploadedFiles = store.get('uploadedFiles', []) as UploadedFileInfo[];
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
