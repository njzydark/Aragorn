import { ISetting, IApi, ISdk, UserSdk, UserSdkList } from 'types';
import { v4 as uuidv4 } from 'uuid';
import { sdks } from './sdk';

// 默认设置
const defaultBasic: ISetting = {
  urlType: 'URL',
  defaultUploaderName: '',
  proxy: '',
  autoCopy: true,
  autoRecover: false,
  showNotifaction: true,
  sound: true,
  autoStart: false,
  autoUpdate: false
};

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

export class Setting {
  private static instance: Setting;
  /** 基础设置信息 */
  basic: ISetting;
  /** 默认Api配置信息 */
  defaultApi: IApi;
  /** 用户配置的所有自定义Api */
  userApiList: IApi[];
  /** SDK下拉列表 */
  sdks: ISdk[];
  /** 用户配置的所有SDK */
  userSdkList: UserSdkList;

  private constructor() {
    this.basic = defaultBasic;
    this.defaultApi = defaultApi;
    this.userApiList = [];
    this.sdks = sdks;
    this.userSdkList = [];
  }

  static getInstance() {
    if (!Setting.instance) {
      Setting.instance = new Setting();
    }
    return Setting.instance;
  }

  getBasic() {
    console.log('获取基础设置');
    return this.basic;
  }

  updateBasic(basic: ISetting) {
    console.log('更新基础设置');
    this.basic = basic;
    return this.basic;
  }

  getDefaultApi() {
    console.log('获取默认API配置信息');
    return this.defaultApi;
  }

  getApiList() {
    console.log('获取用户所有的自定义API');
    return this.userApiList;
  }

  addApi(api: IApi) {
    console.log(`添加名称为${api.name}的自定义API`);
    api.type = 'custom';
    api.uuid = uuidv4();
    this.userApiList.push(api);
    return api;
  }

  getApi(api: IApi) {
    console.log(`获取${api.name}的API配置信息`);
    return this.userApiList.find(item => item.uuid === api.uuid);
  }

  updateApi(api: IApi) {
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

  deleteApi(uuid: string) {
    console.log(`删除uuid为${uuid}的API配置信息`);
    this.userApiList = this.userApiList.filter(item => item.uuid != uuid);
    return this.userApiList;
  }

  getDefaultSdkList() {
    console.log('获取SDK下拉列表');
    return this.sdks;
  }

  getSdkList() {
    console.log('获取用户配置的所有SDK');
    return this.userSdkList;
  }

  addSdk(sdk: UserSdk) {
    console.log(`添加名称为${sdk.name}的SDK配置信息`);
    sdk.uuid = uuidv4();
    sdk.type = 'sdk';
    this.userSdkList.push(sdk);
    return sdk;
  }

  getSdk(sdk: UserSdk) {
    console.log(`获取名称为${sdk.name}的SDK配置信息`);
    return this.userSdkList.find(item => item.uuid === sdk.uuid);
  }

  updateSdk(sdk: UserSdk) {
    console.log(`更新名称为${sdk.name}的SDK配置信息`);
    // TODO: 更新逻辑要优化
    this.userSdkList = this.userSdkList.map(item => {
      if (item.uuid === sdk.uuid) {
        item = sdk;
      }
      return item;
    });
    return this.userSdkList;
  }

  deleteSdk(uuid: string) {
    console.log(`删除UUID为${uuid}的SDK配置信息`);
    this.userSdkList = this.userSdkList.filter(item => item.uuid != uuid);
    return this.userSdkList;
  }
}
