/**
 * 自定义上传接口Api
 */
export interface IApi {
  /** uuid */
  uuid?: string;
  /** API名称 */
  name: string;
  /** 类型 */
  type: 'custom';
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
  /** 是否为默认上传方式 */
  isDefault?: boolean;
}
