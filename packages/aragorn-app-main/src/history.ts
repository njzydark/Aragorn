import { historyStore } from './store';
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
    this.uploadedFiles = historyStore.get('history', []) as UploadedFileInfo[];
  }

  add(uploadedFiles: UploadedFileInfo[]) {
    this.uploadedFiles.unshift(...uploadedFiles);
    historyStore.set('history', this.uploadedFiles);
    return this.uploadedFiles;
  }

  clear(ids: string[]) {
    ids.forEach(id => {
      const index = this.uploadedFiles.findIndex(item => item.id === id);
      if (index > -1) {
        this.uploadedFiles.splice(index, 1);
      }
    });
    historyStore.set('history', this.uploadedFiles);
    return this.uploadedFiles;
  }

  get() {
    return this.uploadedFiles;
  }
}
