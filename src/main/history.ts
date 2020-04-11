import { IImage } from 'types';

export class History {
  private static instance: History;
  images: Partial<IImage>[];

  private constructor() {
    this.images = [];
  }

  static getInstance() {
    if (!History.instance) {
      History.instance = new History();
    }
    return History.instance;
  }

  add(image: Partial<IImage>) {
    this.images.unshift(image);
    return this.images;
  }

  get() {
    return this.images;
  }
}
