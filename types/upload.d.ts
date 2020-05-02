export type UploadResponse = {
  success: boolean;
  desc?: string;
  data?: UploadFileInfo;
};

/** 上传成功之后的文件信息 */
export type UploadFileInfo = {
  /** 文件名 */
  name: string;
  /** 文件类型 */
  type?: string;
  /** 文件大小 */
  size?: number;
  /** 上传时间 */
  date: number;
  /** 文件后缀 */
  extension?: string;
  /** 图片url */
  url?: string;
};
