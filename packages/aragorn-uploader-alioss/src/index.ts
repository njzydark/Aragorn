import { BaseUploader } from 'aragorn-shared';
import {
  Uploader,
  UploadOptions,
  UploadResponse,
  FileListResponse,
  DeleteFileResponse,
  CreateDirectoryResponse,
  UploaderConfig
} from 'aragorn-types';
import OSS from 'ali-oss';
import { options as defaultOptions } from './options';

interface Config extends UploaderConfig {
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

export class AliOssUploader extends BaseUploader<Config> implements Uploader {
  name = '阿里云OSS';
  docUrl = 'https://github.com/ali-sdk/ali-oss';
  defaultOptions = defaultOptions.concat(this.commonUploaderOptions.path, this.commonUploaderOptions.params);
  client: any;

  setConfig(config: Config) {
    if (config.endpoint) {
      config.cname = true;
    }
    this.config = config;
    this.client = new OSS(config);
  }

  async upload(options: UploadOptions): Promise<UploadResponse> {
    try {
      const { file, fileName, directoryPath, isFromFileManage } = options;
      const fileStream = this.getStream(file);
      const { path, bucket, endpoint = '', params = '' } = this.config;
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
        const errorDomain = endpoint ? `${bucket}.${endpoint.replace(/(https?:\/\/|www\.)/, '')}` : '';
        if (errorDomain && url.includes(errorDomain)) {
          url = url.replace(errorDomain, endpoint.replace(/(https?:\/\/|www\.)/, ''));
        }
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
      const { endpoint = '', bucket, params = '' } = this.config;
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
          const errorDomain = endpoint ? `${bucket}.${endpoint.replace(/(https?:\/\/|www\.)/, '')}` : '';
          if (errorDomain && item.url.includes(errorDomain)) {
            item.url = item.url.replace(errorDomain, endpoint.replace(/(https?:\/\/|www\.)/, ''));
          }
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
}
