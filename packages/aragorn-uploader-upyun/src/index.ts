import { Uploader, UploaderOptions } from 'aragorn-types';
import path from 'path';
import upyun from 'upyun';
import { ReadStream, createReadStream } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { options as defaultOptions } from './options';

interface Config {
  serviceName: string;
  operatorName: string;
  operatorPassword: string;
  domain: string;
  directory: string;
}

export class UpyunUploader implements Uploader {
  name = '又拍云';
  docUrl = 'https://github.com/upyun/node-sdk';
  defaultOptions = defaultOptions;
  options = defaultOptions;
  client: any;

  changeOptions(newOptions: UploaderOptions) {
    this.options = newOptions;
  }

  async upload(files: string[]) {
    const fileExtName = path.extname(files[0]);
    const fileName = uuidv4() + fileExtName;
    const file = createReadStream(files[0]);
    const { domain, directory } = this.getConfig();
    try {
      const res = await this.ypyunUpload(fileName, file);
      if (res) {
        return {
          success: true,
          desc: '上传成功',
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
    const config = this.options.reduce((pre, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {});
    return config as Config;
  }
}
