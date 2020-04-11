/**
 * 对象存储SDK
 */
export interface ISdk {
  /** SDK名称 */
  sdkName: string;
  /** SDK文档地址 */
  docUrl?: string;
  /** 配置项 */
  configurationList: SdkConfigurationList;
  /** 上传方法 */
  upload: (files: string[]) => Promise<{ success: boolean; info?: { url: string }; err?: Error }>;
}

/**
 * SDK配置项
 * @description 单个配置项的信息
 */
export type SdkConfiguration = {
  /** 表单字段描述 */
  label: string;
  /** 表单字段名 */
  name: string;
  /** 默认值 */
  value: any;
  /** 值类型 */
  valueType: 'input' | 'switch' | 'select';
  /** select选项 */
  options?: { label: string; value: any }[];
  /** 是否必填 */
  required?: boolean;
  /** 配置项描述 */
  desc?: string;
};

/**
 * SDK配置项列表
 * @description SDK的所有配置项
 */
export type SdkConfigurationList = SdkConfiguration[];
