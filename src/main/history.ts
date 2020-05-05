import { UploadedFileInfo } from 'types';

export class History {
  private static instance: History;
  uploadedFiles: UploadedFileInfo[];

  private constructor() {
    this.uploadedFiles = [];
  }

  static getInstance() {
    if (!History.instance) {
      History.instance = new History();
    }
    return History.instance;
  }

  add(uploadedFile: UploadedFileInfo) {
    this.uploadedFiles.unshift(uploadedFile);
    return this.uploadedFiles;
  }

  get() {
    return this.uploadedFiles;
  }
}
