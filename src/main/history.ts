import { UploadFileInfo } from 'types';

export class History {
  private static instance: History;
  images: Partial<UploadFileInfo>[];

  private constructor() {
    this.images = [];
  }

  static getInstance() {
    if (!History.instance) {
      History.instance = new History();
    }
    return History.instance;
  }

  add(image: Partial<UploadFileInfo>) {
    this.images.unshift(image);
    return this.images;
  }

  get() {
    return this.images;
  }
}
