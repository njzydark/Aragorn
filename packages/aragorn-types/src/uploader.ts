/**
 * 上传器
 * @description 基于相关对象存储 SDK 开发，供 Aragorn 使用
 */
export interface Uploader {
  /** 名称 全局唯一 */
  name: string;
  /** SDK 相关文档地址 */
  docUrl?: string;
  /** 默认配置项 */
  defaultOptions: UploaderOptions;
  /** 配置项 方法调用时需要调用 changeOptions 方法修改 */
  options: UploaderOptions;
  /** 改变options */
  changeOptions: (newOptions: UploaderOptions) => void;
  /** 上传方法 */
  upload: (filePath: string, fileName: string) => Promise<SuccessResponse | FailResponse>;
}

interface UploaderOption {
  /** 表单字段描述 */
  label: string;
  /** 表单字段名 */
  name: string;
  /** 默认值 */
  value: any;
  /** 值类型 */
  valueType: 'input' | 'switch' | 'select';
  /** select 选项 */
  options?: { label: string; value: any }[];
  /** 是否必填 */
  required?: boolean;
  /** 配置项描述 */
  desc?: string;
}

export type UploaderOptions = UploaderOption[];

export interface UploadResponseData {
  /** 文件名 */
  name?: string;
  /** 文件url */
  url: string;
  [property: string]: any;
}

export interface SuccessResponse {
  success: true;
  data: UploadResponseData;
}

export interface FailResponse {
  success: false;
  desc: string;
}
