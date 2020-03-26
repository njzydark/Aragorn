import { IBasic, IApi } from 'types';

const defaultBasic: IBasic = {
  urlType: 'URL',
  defaultApiName: '',
  proxy: '',
  autoCopy: true,
  autoRecover: false,
  showNotifaction: true,
  sound: true,
  autoStart: false,
  autoUpdate: false
};

const defaultApi: IApi = {
  name: '',
  url: '',
  method: 'POST',
  contentType: 'multipart/form-data',
  fileFieldName: 'file',
  requestParams: '',
  requestBody: '',
  responseUrlFieldName: 'url',
  createTime: new Date().getTime()
};

const testApi: IApi = {
  name: '本地测试',
  url: 'http://localhost:3001/upload',
  method: 'POST',
  contentType: 'multipart/form-data',
  fileFieldName: 'file',
  requestParams: '',
  requestBody: '',
  responseUrlFieldName: 'url',
  createTime: new Date().getTime()
};

export class Setting {
  basic: IBasic;
  defaultApi: IApi;
  apiList: IApi[];

  constructor() {
    this.basic = defaultBasic;
    this.defaultApi = defaultApi;
    this.apiList = [testApi];
  }

  getBasic() {
    console.log('获取基础设置');
    return this.basic;
  }

  updateBasic(basic: IBasic) {
    console.log('更新基础设置');
    this.basic = basic;
    return this.basic;
  }

  getDefaultApi() {
    console.log('获取默认API配置');
    return this.defaultApi;
  }

  getApiList() {
    console.log('获取所有API配置');
    return this.apiList;
  }

  addApi(api: IApi) {
    console.log('添加API配置');
    api.createTime = new Date().getTime();
    this.apiList.push(api);
    return this.apiList;
  }

  getApi(createTime: number) {
    console.log('获取API配置');
    return this.apiList.find(item => item.createTime === createTime);
  }

  updateApi(api: IApi) {
    console.log('更新API配置');
    // TODO: 更新逻辑要优化
    this.apiList = this.apiList.map(item => {
      if (item.createTime === api.createTime) {
        item = api;
      }
      return item;
    });
    return this.apiList;
  }

  deleteApi(createTime: number) {
    console.log('删除API配置');
    this.apiList = this.apiList.filter(item => item.createTime != createTime);
    return this.apiList;
  }
}
