import { Uploader, UploaderOptions } from 'aragorn-types';
import qiniu from 'qiniu';
import path from 'path';
import { ReadStream, createReadStream } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { options as defaultOptions } from './options';

export class QiniuUploader implements Uploader {
  name = '七牛云';
  docUrl = 'https://developer.qiniu.com/kodo/sdk/1289/nodejs';
  defaultOptions = defaultOptions;
  options = defaultOptions;

  changeOptions(newOptions: UploaderOptions) {
    this.options = newOptions;
  }

  async upload(files: string[]) {
    const fileExtName = path.extname(files[0]);
    const fileName = uuidv4() + fileExtName;
    const file = createReadStream(files[0]);
    try {
      const { key }: any = await this.qiniuUpload(fileName, file);
      const url = this.qiniuDownload(key);
      if (url) {
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

  protected qiniuUpload(fileName: string, file: ReadStream) {
    const config = this.getConfig();
    const token = this.getToken();
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();
    return new Promise((resolve, reject) => {
      formUploader.putStream(token, fileName, file, putExtra, function (respErr, respBody, respInfo) {
        if (respErr) {
          console.log(respErr);
          reject(respErr);
        }
        console.log('qiniu-upload', respInfo);
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
