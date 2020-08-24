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
  directory?: string;
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

  async upload(filePath: string, fileName: string, directoryPath?: string): Promise<SuccessResponse | FailResponse> {
    const file = createReadStream(filePath);
    try {
      const url = (await this.ossUpload(fileName, file, directoryPath)) as string;
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

  async getFileList(directoryPath?: string) {
    try {
      const res = await this.client.list({ delimiter: '/', prefix: directoryPath ? directoryPath + '/' : '' });
      let dirData = [];
      if (res?.prefixes?.length > 0) {
        dirData = res.prefixes.map(item => {
          return {
            name: item
              .split('/')
              .filter(item => item)
              .pop(),
            type: 'directory'
          };
        });
      }
      let data = res.objects || [];
      data = data.filter(item => /.*[^\/]$/g.test(item?.name));
      data.unshift(...dirData);
      return data;
    } catch (err) {
      return {
        success: false,
        desc: err.message
      };
    }
  }

  async deleteFile(fileNames: string[]) {
    try {
      if (fileNames.length === 0) {
        await this.client.delete(fileNames[0]);
      } else {
        await this.client.deleteMulti(fileNames);
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  async createDirectory(directoryPath: string) {
    try {
      await this.client.put(`${directoryPath}/`, Buffer.from(''));
      return true;
    } catch (err) {
      return false;
    }
  }

  protected async ossUpload(fileName: string, file: ReadStream, directoryPath?: string) {
    const { directory } = this.config;
    const newFileName = directoryPath
      ? `${directoryPath}/${fileName}`
      : directory
      ? `${directory}/${fileName}`
      : fileName;
    let putRes = await this.client.put(newFileName, file);
    if (putRes?.res?.status === 200) {
      return this.client.generateObjectUrl(newFileName);
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
