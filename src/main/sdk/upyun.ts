import { ISdk, SdkConfigurationList, UploadResponse } from 'types';
import { ReadStream, createReadStream } from 'fs';
import path from 'path';
import upyun from 'upyun';
import { v4 as uuidv4 } from 'uuid';

type Config = {
  serviceName: string;
  operatorName: string;
  operatorPassword: string;
  domain: string;
  directory: string;
};

const defaultConfigurationList: SdkConfigurationList = [
  {
    label: '服务名称',
    name: 'serviceName',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: '操作员',
    name: 'operatorName',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: '操作员密码',
    name: 'operatorPassword',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: '域名',
    name: 'domain',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: '文件存放目录',
    name: 'directory',
    value: '',
    valueType: 'input'
  }
];

export class Upyun implements ISdk {
  sdkName = '又拍云';
  configurationList = defaultConfigurationList;
  nowConfigurationList = [] as SdkConfigurationList;
  docUrl = 'https://github.com/upyun/node-sdk';
  client: any;

  public async upload(files: string[]): Promise<UploadResponse> {
    const fileExtName = path.extname(files[0]);
    const fileName = uuidv4() + fileExtName;
    const file = createReadStream(files[0]);
    const { domain, directory } = this.getConfig();
    try {
      const res = await this.ypyunUpload(fileName, file);
      if (res) {
        return {
          success: true,
          data: {
            name: fileName,
            url: directory ? `${domain}/${directory}/${fileName}` : `${domain}/${fileName}`
          }
        };
      } else {
        return {
          success: false,
          desc: '又拍云上传失败'
        };
      }
    } catch (err) {
      return {
        success: false,
        desc: err.message
      };
    }
  }

  protected async ypyunUpload(fileName: string, file: ReadStream) {
    const { serviceName, operatorName, operatorPassword, directory } = this.getConfig();
    const service = new upyun.Service(serviceName, operatorName, operatorPassword);
    this.client = new upyun.Client(service);
    const putFileUrl = directory ? `/${directory}/${fileName}` : `/${fileName}`;
    return await this.client.putFile(putFileUrl, file);
  }

  protected async ypyunDownload(fileName: string) {
    return await this.client.getFile(fileName);
  }

  protected getConfig(): Config {
    const config = this.nowConfigurationList.reduce((pre, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {});
    return config as Config;
  }
}
