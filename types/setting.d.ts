import { ISdk } from './sdk';

/** App设置 */
export interface ISetting {
  /** 上传成功后链接复制的格式 */
  urlType: 'URL' | 'HTML' | 'Markdown';
  /** 默认的上传方式名称 */
  defaultUploaderName?: string;
  /** 代理设置 */
  proxy: string;
  /** 自动复制 */
  autoCopy: boolean;
  /** 自动恢复粘贴板内容 */
  autoRecover: boolean;
  /** 是否显示系统通知 */
  showNotifaction: boolean;
  /** 是否发出系统提示音 */
  sound: boolean;
  /** 开启自启 */
  autoStart: boolean;
  /** 自动检查更新 */
  autoUpdate: boolean;
}

/**
 * 用户的SDK配置
 */
export type UserSdk = ISdk & {
  uuid?: string;
  name: string;
  type: 'sdk';
};

/**
 * 用户所有的SDK配置
 */
export type UserSdkList = UserSdk[];
