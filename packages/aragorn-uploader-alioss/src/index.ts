import { Uploader, UploaderOptions } from 'aragorn-types';
import path from 'path';
import Oss from 'ali-oss';
import { v4 as uuidv4 } from 'uuid';
import { options as defaultOptions } from './options';
import { createReadStream, ReadStream } from 'fs';

interface Config {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  region: string;
  timeout?: string;
  endpoint?: string;
  cname?: boolean;
  isRequestPay?: boolean;
  secure?: false;
  internal?: false;
}

export class AliOssUploader implements Uploader {
  name = '阿里OSS';
  docUrl = 'https://github.com/ali-sdk/ali-oss';
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
    try {
      const res = await this.ossUpload(fileName, file);
      if (res) {
        const url = this.client.generateObjectUrl(fileName);
        return {
          success: true,
          desc: '上传成功',
          data: {
            name: fileName,
            url
          }
        };
      } else {
        return {
          success: false,
          desc: '上传失败'
        };
      }
    } catch (err) {
      return {
        success: false,
        desc: err.message
      };
    }
  }

  protected async ossUpload(fileName: string, file: ReadStream) {
    const uploaderOptions = this.getConfig();
    this.client = new Oss(uploaderOptions);
    let putRes = await this.client.put(fileName, file);
    if (putRes?.res?.status === 200) {
      return true;
    }
  }

  protected getConfig(): Config {
    const config = this.options.reduce((pre, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {});
    return config as Config;
  }
}
