import { IApi } from 'types';
import { v4 as uuidv4 } from 'uuid';

// 默认自定义API配置
const defaultApi: IApi = {
  name: '',
  type: 'custom',
  url: '',
  method: 'POST',
  contentType: 'multipart/form-data',
  fileFieldName: 'file',
  requestParams: '',
  requestBody: '',
  responseUrlFieldName: 'url'
};

export class Api {
  private static instance: Api;
  /** 默认Api配置信息 */
  defaultApi: IApi;
  /** 用户配置的所有自定义Api */
  userApiList: IApi[];

  private constructor() {
    this.defaultApi = defaultApi;
    this.userApiList = [];
  }

  static getInstance() {
    if (!Api.instance) {
      Api.instance = new Api();
    }
    return Api.instance;
  }

  getDefault() {
    console.log('获取默认API配置信息');
    return this.defaultApi;
  }

  getList() {
    console.log('获取用户所有的自定义API');
    return this.userApiList;
  }

  add(api: IApi) {
    console.log(`添加名称为${api.name}的自定义API`);
    api.type = 'custom';
    api.uuid = uuidv4();
    this.userApiList.push(api);
    return api;
  }

  get(api: IApi) {
    console.log(`获取${api.name}的API配置信息`);
    return this.userApiList.find(item => item.uuid === api.uuid);
  }

  update(api: IApi) {
    console.log(`更新${api.name}的API配置信息`);
    // TODO: 更新逻辑要优化
    this.userApiList = this.userApiList.map(item => {
      if (item.uuid === api.uuid) {
        item = api;
      }
      return item;
    });
    return this.userApiList;
  }

  delete(uuid: string) {
    console.log(`删除uuid为${uuid}的API配置信息`);
    this.userApiList = this.userApiList.filter(item => item.uuid != uuid);
    return this.userApiList;
  }
}
