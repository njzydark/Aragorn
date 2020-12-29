import {
  Uploader,
  UploaderOptions,
  UploadOptions,
  UploadResponse,
  FileListResponse,
  DeleteFileResponse,
  CreateDirectoryResponse
} from 'aragorn-types';
import OSS from 'ali-oss';
import { options as defaultOptions } from './options';
import { createReadStream } from 'fs';
import { Readable } from 'stream';

interface Config {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  region: string;
  endpoint?: string;
  cname?: boolean;
  path?: string;
  isRequestPay?: boolean;
  secure?: false;
  params?: string;
}

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

  async upload(options: UploadOptions): Promise<UploadResponse> {
    try {
      const { file, fileName, directoryPath, isFromFileManage } = options;
      const fileStream = this.getStream(file);
      const { path, params = '' } = this.config;
      let newFileName = '';
      if (isFromFileManage) {
        newFileName = directoryPath ? `${directoryPath}/${fileName}` : fileName;
      } else {
        newFileName = path ? `${path}/${fileName}` : fileName;
      }
      let putRes = await this.client.put(newFileName, fileStream);
      if (putRes?.res?.status !== 200) {
        return {
          success: false,
          desc: '上传失败'
        };
      }
      let url = await this.client.generateObjectUrl(newFileName);
      if (url) {
        return {
          success: true,
          data: { url: url + params }
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

  async getFileList(directoryPath?: string): Promise<FileListResponse> {
    try {
      const { params = '' } = this.config;
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
      data = data
        .filter(item => /.*[^\/]$/g.test(item?.name))
        .map(item => {
          item.url = item.url + params;
          return item;
        });
      data.unshift(...dirData);
      return {
        success: true,
        data
      };
    } catch (err) {
      return {
        success: false,
        desc: err.message
      };
    }
  }

  async deleteFile(fileNames: string[]): Promise<DeleteFileResponse> {
    try {
      if (fileNames.length === 1) {
        await this.client.delete(fileNames[0]);
      } else {
        await this.client.deleteMulti(fileNames);
      }
      return { success: true };
    } catch (err) {
      return { success: false, desc: err.message };
    }
  }

  async createDirectory(directoryPath: string): Promise<CreateDirectoryResponse> {
    try {
      await this.client.put(`${directoryPath}/`, Buffer.from(''));
      return { success: true };
    } catch (err) {
      return { success: false, desc: err.message };
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

  protected getStream(file: string | Buffer) {
    if (Buffer.isBuffer(file)) {
      return new Readable({
        read() {
          this.push(file);
          this.push(null);
        }
      });
    } else {
      return createReadStream(file);
    }
  }
}
