import { IImage } from 'types';

export class History {
  images: Partial<IImage>[];

  constructor() {
    this.images = [];
  }

  add(image: Partial<IImage>) {
    this.images.unshift(image);
    return this.images;
  }

  get() {
    return this.images;
  }
}
