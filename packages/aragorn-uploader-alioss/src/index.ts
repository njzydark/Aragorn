import { Uploader, UploaderOptions, SuccessResponse, FailResponse } from 'aragorn-types';
import OSS from 'ali-oss';
import { options as defaultOptions } from './options';
import { createReadStream, ReadStream } from 'fs';

type Config = {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  region: string;
  endpoint?: string;
  cname?: boolean;
  isRequestPay?: boolean;
  secure?: false;
};

export class AliOssUploader implements Uploader {
  name = '阿里云OSS';
  docUrl = 'https://github.com/ali-sdk/ali-oss';
  defaultOptions = defaultOptions;
  options = defaultOptions;
  client: any;
  config = {} as Config;

  changeOptions(newOptions: UploaderOptions) {
    this.options = newOptions;
    this.config = this.getConfig();
    this.client = new OSS(this.config);
  }

  async upload(filePath: string, fileName: string): Promise<SuccessResponse | FailResponse> {
    const file = createReadStream(filePath);
    try {
      const url = (await this.ossUpload(fileName, file)) as string;
      if (url) {
        return {
          success: true,
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
        desc: err.message as string
      };
    }
  }

  async list() {
    try {
      const res = await this.client.list({});
      console.log(res);
      return {
        success: true,
        desc: '列表数据获取成功',
        data: res.objects
      };
    } catch (err) {
      return {
        success: false,
        desc: err.message
      };
    }
  }

  protected async ossUpload(fileName: string, file: ReadStream) {
    let putRes = await this.client.put(fileName, file);
    if (putRes?.res?.status === 200) {
      return this.client.generateObjectUrl(fileName);
    }
  }

  protected getConfig(): Config {
    const config = this.options.reduce((pre, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {} as Config);
    if (config.endpoint) {
      config.cname = true;
    }
    return config as Config;
  }
}
