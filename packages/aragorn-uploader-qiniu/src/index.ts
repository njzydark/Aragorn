import {
  Uploader,
  UploaderOptions,
  UploadResponse,
  FileListResponse,
  DeleteFileResponse,
  CreateDirectoryResponse
} from 'aragorn-types';
import qiniu from 'qiniu';
import { ReadStream, createReadStream } from 'fs';
import { options as defaultOptions } from './options';
import { Readable } from 'stream';

interface Config {
  accessKey: string;
  secretKey: string;
  zone: string;
  bucket: string;
  domain: string;
  path?: string;
}

export class QiniuUploader implements Uploader {
  name = '七牛云';
  docUrl = 'https://developer.qiniu.com/kodo/sdk/1289/nodejs';
  defaultOptions = defaultOptions;
  options = defaultOptions;
  config = {} as Config;

  changeOptions(newOptions: UploaderOptions) {
    this.options = newOptions;
    this.config = this.getConfig();
  }

  async upload(
    filePath: string,
    fileName: string,
    directoryPath?: string,
    isFromFileManage?: boolean
  ): Promise<UploadResponse> {
    try {
      const file = createReadStream(filePath);
      const { path } = this.config;
      let newFileName = '';
      if (isFromFileManage) {
        newFileName = directoryPath ? `${directoryPath}/${fileName}` : `${fileName}`;
      } else {
        newFileName = path ? `${path}/${fileName}` : `${fileName}`;
      }
      const { key }: any = await this.qiniuUpload(newFileName, file);
      const url = this.qiniuDownload(key);
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
        desc: err.message
      };
    }
  }

  async getFileList(directoryPath?: string): Promise<FileListResponse> {
    try {
      const mac = this.getMac();
      const config = this.getQiniuConfig();
      const bucketManager = new qiniu.rs.BucketManager(mac, config);
      const { bucket, domain } = this.config;
      const { resInfo, resBody } = await new Promise((resolve, reject) => {
        bucketManager.listPrefix(
          bucket,
          { delimiter: '/', prefix: directoryPath ? directoryPath + '/' : '' },
          (err, resBody, resInfo) => {
            if (err) {
              reject(err);
            } else {
              resolve({
                resBody,
                resInfo
              });
            }
          }
        );
      });
      if (resInfo.statusCode === 200) {
        let filesData = [];
        if (resBody?.items?.length > 0) {
          resBody.items = resBody.items.filter(item => /.*[^\/]$/g.test(item?.key));
          filesData = resBody.items.map(item => {
            item.name = item.key
              .split('/')
              .filter(item => item)
              .pop();
            return {
              name: item.name,
              url: directoryPath ? `${domain}/${directoryPath}/${item.name}` : `${domain}/${item.name}`,
              lastModified: item.putTime / 10000,
              size: item.fsize
            };
          });
        }
        let directoryData = [];
        if (resBody?.commonPrefixes?.length > 0) {
          directoryData = resBody.commonPrefixes.map(item => {
            return {
              name: item
                .split('/')
                .filter(item => item)
                .pop(),
              type: 'directory'
            };
          });
        }
        return {
          success: true,
          data: [...directoryData, ...filesData]
        };
      } else {
        return {
          success: false,
          desc: '文件列表获取失败'
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
      const mac = this.getMac();
      const config = this.getQiniuConfig();
      const { bucket } = this.config;
      const bucketManager = new qiniu.rs.BucketManager(mac, config);
      const deleteOperations = fileNames.map(item => {
        return qiniu.rs.deleteOp(bucket, item);
      });
      const resInfo = await new Promise<{ statusCode: number }>((resolve, reject) => {
        bucketManager.batch(deleteOperations, function (err, _, resInfo) {
          if (err) {
            reject(err);
          } else {
            resolve(resInfo);
          }
        });
      });
      if (Math.floor(resInfo.statusCode / 100) === 2) {
        return { success: true };
      } else {
        return { success: false, desc: '删除失败' };
      }
    } catch (err) {
      return { success: false, desc: err.message };
    }
  }

  async createDirectory(directoryPath: string): Promise<CreateDirectoryResponse> {
    try {
      const config = this.getQiniuConfig();
      const token = this.getToken();
      const formUploader = new qiniu.form_up.FormUploader(config);
      const putExtra = new qiniu.form_up.PutExtra();
      const fileStream = Readable.from([Buffer.from('')]);
      await new Promise((resolve, reject) => {
        formUploader.putStream(token, `${directoryPath}/`, fileStream, putExtra, function (respErr) {
          if (respErr) {
            reject(respErr);
          }
          resolve();
        });
      });
      return { success: true };
    } catch (err) {
      return { success: false, desc: err.message };
    }
  }

  protected qiniuUpload(fileName: string, file: ReadStream) {
    const config = this.getQiniuConfig();
    const token = this.getToken();
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();
    return new Promise((resolve, reject) => {
      formUploader.putStream(token, fileName, file, putExtra, function (respErr, respBody, respInfo) {
        if (respErr) {
          reject(respErr);
        }
        resolve(respBody);
      });
    });
  }

  protected qiniuDownload(key) {
    const config = this.getQiniuConfig();
    const mac = this.getMac();
    const { domain } = this.config;
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    return bucketManager.publicDownloadUrl(domain, key);
  }

  protected getToken() {
    const mac = this.getMac();
    const { bucket } = this.config;
    const options = {
      scope: bucket
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(mac);
  }

  protected getMac() {
    const { accessKey, secretKey } = this.config;
    return new qiniu.auth.digest.Mac(accessKey, secretKey);
  }

  protected getQiniuConfig() {
    const { zone } = this.config;
    const config = new qiniu.conf.Config({
      zone: qiniu.zone[zone]
    });
    return config;
  }

  protected getConfig(): Config {
    const config = this.options.reduce((pre, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {});
    return config as Config;
  }
}
