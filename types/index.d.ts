/** 上传的图片信息 */
export interface IImage {
  src: string;
  width: number;
  height: number;
  date: number;
  path: string;
  sizes: string[];
}

export * from './setting';
export * from './api';
export * from './sdk';
