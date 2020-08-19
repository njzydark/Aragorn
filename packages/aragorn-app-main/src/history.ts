import store from './store';
import { UploadedFileInfo } from './uploaderManager';

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

  add(uploadedFiles: UploadedFileInfo[]) {
    this.uploadedFiles.unshift(...uploadedFiles);
    store.set('uploadedFiles', this.uploadedFiles);
    return this.uploadedFiles;
  }

  get() {
    return this.uploadedFiles;
  }
}
