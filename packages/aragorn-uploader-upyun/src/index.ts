import {
  Uploader,
  UploaderOptions,
  UploadOptions,
  UploadResponse,
  FileListResponse,
  DeleteFileResponse,
  CreateDirectoryResponse
} from 'aragorn-types';
import upyun from 'upyun';
import { createReadStream } from 'fs';
import { options as defaultOptions } from './options';
import { Readable } from 'stream';

interface Config {
  serviceName: string;
  operatorName: string;
  operatorPassword: string;
  domain: string;
  path?: string;
  params?: string;
}

export class UpyunUploader implements Uploader {
  name = '又拍云';
  docUrl = 'https://github.com/upyun/node-sdk';
  defaultOptions = defaultOptions;
  options = defaultOptions;
  client: any;

  changeOptions(newOptions: UploaderOptions) {
    this.options = newOptions;
    const { serviceName, operatorName, operatorPassword } = this.getConfig();
    const service = new upyun.Service(serviceName, operatorName, operatorPassword);
    this.client = new upyun.Client(service);
  }

  async upload(options: UploadOptions): Promise<UploadResponse> {
    try {
      const { file, fileName, directoryPath, isFromFileManage } = options;
      const fileStream = this.getStream(file);
      const { domain, path, params = '' } = this.getConfig();
      let newFileName = '';
      if (isFromFileManage) {
        newFileName = directoryPath ? `/${directoryPath}/${fileName}` : `/${fileName}`;
      } else {
        newFileName = path ? `/${path}/${fileName}` : `/${fileName}`;
      }
      const res = await this.client.putFile(newFileName, fileStream);
      if (res) {
        return {
          success: true,
          data: {
            url: encodeURI(`${domain}${newFileName}`) + params
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

  async getFileList(directoryPath?: string): Promise<FileListResponse> {
    try {
      const res = await this.client.listDir(directoryPath);
      const { domain, params = '' } = this.getConfig();
      if (res?.files?.length > 0) {
        res.files.map(item => {
          if (item.type === 'F') {
            item.type = 'directory';
          } else {
            item.url =
              encodeURI(directoryPath ? `${domain}/${directoryPath}/${item.name}` : `${domain}/${item.name}`) + params;
            item.lastModified = item.time ? item.time * 1000 : '';
          }
          return item;
        });
        return {
          success: true,
          data: res.files
        };
      } else {
        return {
          success: true,
          data: []
        };
      }
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
        await this.client.deleteFile(fileNames[0]);
      } else {
        const promises = fileNames.map(async filename => await this.client.deleteFile(filename));
        await Promise.all(promises);
      }
      return { success: true };
    } catch (err) {
      return { success: false, desc: err.message };
    }
  }

  async createDirectory(directoryPath: string): Promise<CreateDirectoryResponse> {
    try {
      await this.client.makeDir(`${directoryPath}/`);
      return { success: true };
    } catch (err) {
      return { success: false, desc: err.message };
    }
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
