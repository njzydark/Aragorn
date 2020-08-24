import { Uploader, UploaderOptions, SuccessResponse, FailResponse } from 'aragorn-types';
import upyun from 'upyun';
import { ReadStream, createReadStream } from 'fs';
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
    const { serviceName, operatorName, operatorPassword } = this.getConfig();
    const service = new upyun.Service(serviceName, operatorName, operatorPassword);
    this.client = new upyun.Client(service);
  }

  async upload(
    filePath: string,
    fileName: string,
    directoryPath?: string,
    isFromFileManage?: boolean
  ): Promise<SuccessResponse | FailResponse> {
    try {
      const file = createReadStream(filePath);
      const { domain, directory } = this.getConfig();
      let newFileName = '';
      if (isFromFileManage) {
        newFileName = directoryPath ? `/${directoryPath}/${fileName}` : `/${fileName}`;
      } else {
        newFileName = directory ? `/${directory}/${fileName}` : `/${fileName}`;
      }
      const res = await this.client.putFile(newFileName, file);
      if (res) {
        return {
          success: true,
          data: {
            url: `${domain}${newFileName}`
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

  async getFileList(directoryPath?: string) {
    const res = await this.client.listDir(directoryPath);
    const { domain } = this.getConfig();
    if (res?.files?.length > 0) {
      res.files.map(item => {
        if (item.type === 'F') {
          item.type = 'directory';
        } else {
          item.url = directoryPath ? `${domain}/${directoryPath}/${item.name}` : `${domain}/${item.name}`;
          item.lastModified = item.time ? item.time * 1000 : '';
        }
        return item;
      });
      return res.files;
    } else {
      return [];
    }
  }

  async deleteFile(fileNames: string[]) {
    try {
      if (fileNames.length === 1) {
        await this.client.deleteFile(fileNames[0]);
      } else {
        const promises = fileNames.map(async filename => await this.client.deleteFile(filename));
        await Promise.all(promises);
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  async createDirectory(directoryPath: string) {
    try {
      await this.client.makeDir(`${directoryPath}/`);
      return true;
    } catch (err) {
      return false;
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
}
