import {
  Uploader,
  UploaderOptions,
  UploadResponse,
  FileListResponse,
  DeleteFileResponse,
  CreateDirectoryResponse
} from 'aragorn-types';
import COS from 'cos-nodejs-sdk-v5';
import { options as defaultOptions } from './options';
import { createReadStream } from 'fs';

interface Config {
  SecretId: string;
  SecretKey: string;
  Bucket: string;
  Region: string;
  domain?: string;
  directory?: string;
}

interface GetBucketResponse {
  statusCode: number;
  CommonPrefixes: { Prefix: string }[];
  Contents: { Key: string; LastModified: Date; Size: number; name?: string; url?: string; size?: number }[];
}

export class TencentCosUploader implements Uploader {
  name = '腾讯云COS';
  docUrl = 'https://github.com/tencentyun/cos-nodejs-sdk-v5';
  defaultOptions = defaultOptions;
  options = defaultOptions;
  client: any;
  config = {} as Config;

  changeOptions(newOptions: UploaderOptions) {
    this.options = newOptions;
    this.config = this.getConfig();
    this.client = new COS({ ...this.config, Domain: this.config.domain });
  }

  async upload(
    filePath: string,
    fileName: string,
    directoryPath?: string,
    isFromFileManage?: boolean
  ): Promise<UploadResponse> {
    try {
      const file = createReadStream(filePath);
      const { directory, Bucket, Region } = this.config;
      let newFileName = '';
      if (isFromFileManage) {
        newFileName = directoryPath ? `${directoryPath}/${fileName}` : fileName;
      } else {
        newFileName = directory ? `${directory}/${fileName}` : fileName;
      }
      let res = await new Promise<{ statusCode: number; Location: string }>((resolve, reject) => {
        this.client.putObject({ Bucket, Region, Key: newFileName, Body: file }, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
      if (res?.statusCode === 200) {
        return {
          success: true,
          data: {
            url: `https://${res.Location}`
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

  async getFileList(directoryPath?: string): Promise<FileListResponse> {
    try {
      const { Bucket, Region, domain } = this.config;
      const res = await new Promise<GetBucketResponse>((resolve, reject) => {
        this.client.getBucket(
          {
            Bucket,
            Region,
            Delimiter: '/',
            Prefix: directoryPath ? directoryPath + '/' : ''
          },
          (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          }
        );
      });
      if (res.statusCode !== 200) {
        return {
          success: false
        };
      }
      let dirData = [] as any[];
      if (res?.CommonPrefixes?.length > 0) {
        dirData = res.CommonPrefixes.map(item => {
          return {
            name: item.Prefix.split('/')
              .filter(item => item)
              .pop(),
            type: 'directory'
          };
        });
      }
      res.Contents = res?.Contents.filter(item => /.*[^\/]$/g.test(item?.Key)) || [];
      let filesData = [] as any[];
      filesData = res.Contents.map(item => {
        item.name = item.Key.split('/')
          .filter(item => item)
          .pop();
        return {
          name: item.name,
          url: domain ? `${domain}/${item.Key}` : `https://${Bucket}.cos.${Region}.myqcloud.com/${item.Key}`,
          lastModified: item.LastModified,
          size: item.Size
        };
      });
      return {
        success: true,
        data: [...dirData, ...filesData]
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
      const { Bucket, Region } = this.config;
      const Objects = fileNames.map(item => {
        return {
          Key: item
        };
      });
      const res = await new Promise<{ statusCode: number }>((resolve, reject) => {
        this.client.deleteMultipleObject({ Bucket, Region, Objects }, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
      if (res.statusCode === 200) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (err) {
      return { success: false, desc: err.message };
    }
  }

  async createDirectory(directoryPath: string): Promise<CreateDirectoryResponse> {
    try {
      const { Bucket, Region } = this.config;
      const res = await new Promise<{ statusCode: number }>((resolve, reject) => {
        this.client.putObject({ Bucket, Region, Key: `${directoryPath}/`, Body: '' }, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
      if (res.statusCode === 200) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (err) {
      return { success: false, desc: err.message };
    }
  }

  protected getConfig(): Config {
    const config = this.options.reduce((pre, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {} as Config);
    return config;
  }
}
