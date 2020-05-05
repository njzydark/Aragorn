import { UserSdk } from './setting';
import { IApi } from './api';

export type UploadResponseData = {
  /** 文件名 */
  name: string;
  /** 文件url */
  url?: string;
  [property: string]: any;
};

export type UploadResponse = {
  success: boolean;
  desc?: string;
  data?: UploadResponseData;
};

/** 上传成功之后的文件信息 */
export type UploadedFileInfo = UploadResponseData & {
  /** 文件类型 MimeType */
  type: string;
  /** 上传方式 */
  uploader: UserSdk | IApi;
  /** 文件路径 */
  path: string;
  /** 文件大小 */
  size?: number;
  /** 上传时间 */
  date: number;
};
