/** 调用createWindow方法需要传递的参数 */
export interface IWindowOptions {
  /** 路由地址 hash */
  url?: string;
  /** 是否打开控制台 */
  openDevTools?: boolean;
  /** 窗口宽度 */
  width?: number;
  /** 窗口高度 */
  height?: number;
}

/** App 基础设置 */
export interface IBasic {
  /** 上传成功后链接复制的格式 */
  urlType: 'URL' | 'HTML' | 'Markdown';
  /** 默认的上传接口名称 */
  defaultApiName?: string;
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

/** Api接口配置 */
export interface IApi {
  /** API名称 */
  name: string;
  /** API地址 */
  url: string;
  /** 请求类型 默认 POST */
  method: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';
  /** Content-Type */
  contentType: 'multipart/form-data' | 'application/x-www-form-urlencoded' | 'application/json';
  /** 文件上传的字段名称 默认 file */
  fileFieldName: string;
  /** 请求头参数 */
  requestParams?: string;
  /** 请求体参数 */
  requestBody?: string;
  /** 响应的图片地址对应的字段名 */
  responseUrlFieldName: string;
  /** 创建时间 */
  createTime: number;
}

/** 上传的图片信息 */
export interface IImage {
  src: string;
  width: number;
  height: number;
  date: number;
  path: string;
  sizes: string[];
}
