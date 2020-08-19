import { Uploader, UploaderOptions, SuccessResponse, FailResponse } from 'aragorn-types';
import qiniu from 'qiniu';
import { ReadStream, createReadStream } from 'fs';
import { options as defaultOptions } from './options';

export class QiniuUploader implements Uploader {
  name = '七牛云';
  docUrl = 'https://developer.qiniu.com/kodo/sdk/1289/nodejs';
  defaultOptions = defaultOptions;
  options = defaultOptions;

  changeOptions(newOptions: UploaderOptions) {
    this.options = newOptions;
  }

  async upload(filePath: string, fileName: string): Promise<SuccessResponse | FailResponse> {
    const file = createReadStream(filePath);
    try {
      const { key }: any = await this.qiniuUpload(fileName, file);
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

  protected qiniuUpload(fileName: string, file: ReadStream) {
    const config = this.getConfig();
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
    const config = this.getConfig();
    const mac = this.getMac();
    const domain = this.options.find(item => item.name === 'domain')?.value;
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    return bucketManager.publicDownloadUrl(domain, key);
  }

  protected getConfig() {
    const zone = this.options.find(item => item.name === 'zone')?.value;
    const config = new qiniu.conf.Config({
      zone: qiniu.zone[zone]
    });
    return config;
  }

  protected getToken() {
    const mac = this.getMac();
    const bucket = this.options.find(item => item.name === 'bucket')?.value;
    const options = {
      scope: bucket
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(mac);
  }

  protected getMac() {
    const accessKey = this.options.find(item => item.name === 'accessKey')?.value;
    const secretKey = this.options.find(item => item.name === 'secretKey')?.value;
    return new qiniu.auth.digest.Mac(accessKey, secretKey);
  }
}
