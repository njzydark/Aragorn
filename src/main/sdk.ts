import { ISdk, UserSdkList, UserSdk } from 'types';
import { v4 as uuidv4 } from 'uuid';
import { sdks } from './sdk/index';
import store from './store';

export class Sdk {
  private static instance: Sdk;
  /** SDK下拉列表 */
  sdks: ISdk[];
  /** 用户配置的所有SDK */
  userSdkList: UserSdkList;

  private constructor() {
    this.sdks = sdks;
    this.userSdkList = store.get('userSdkList', []);
  }

  static getInstance() {
    if (!Sdk.instance) {
      Sdk.instance = new Sdk();
    }
    return Sdk.instance;
  }

  getSdks() {
    console.log('获取所有内置的sdk');
    return this.sdks;
  }

  getList() {
    console.log('获取用户配置的所有SDK');
    return this.userSdkList;
  }

  add(sdk: UserSdk) {
    console.log(`添加名称为${sdk.name}的SDK配置信息`);
    sdk.uuid = uuidv4();
    sdk.type = 'sdk';
    this.userSdkList.push(sdk);
    store.set('userSdkList', this.userSdkList);
    return sdk;
  }

  get(sdk: UserSdk) {
    console.log(`获取名称为${sdk.name}的SDK配置信息`);
    return this.userSdkList.find(item => item.uuid === sdk.uuid);
  }

  update(sdk: UserSdk) {
    console.log(`更新名称为${sdk.name}的SDK配置信息`);
    // TODO: 更新逻辑要优化
    this.userSdkList = this.userSdkList.map(item => {
      if (item.uuid === sdk.uuid) {
        item = sdk;
      }
      return item;
    });
    store.set('userSdkList', this.userSdkList);
    return this.userSdkList;
  }

  delete(uuid: string) {
    console.log(`删除UUID为${uuid}的SDK配置信息`);
    this.userSdkList = this.userSdkList.filter(item => item.uuid != uuid);
    store.set('userSdkList', this.userSdkList);
    return this.userSdkList;
  }
}
