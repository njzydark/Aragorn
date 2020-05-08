import { ISdk, SdkConfigurationList, UploadResponse } from 'types';
import path from 'path';
import { ReadStream, createReadStream } from 'fs';
import qiniu from 'qiniu';
import { v4 as uuidv4 } from 'uuid';

const defaultConfigurationList: SdkConfigurationList = [
  {
    label: 'AccessKey',
    name: 'accessKey',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: 'SecretKey',
    name: 'secretKey',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: 'Zone',
    name: 'zone',
    value: 'Zone_z0',
    valueType: 'select',
    options: [
      {
        label: '华东',
        value: 'Zone_z0'
      },
      {
        label: '华北',
        value: 'Zone_z1'
      },
      {
        label: '华南',
        value: 'Zone_z2'
      },
      {
        label: '北美',
        value: 'Zone_na0'
      },
      {
        label: '东南亚',
        value: 'Zone_as0'
      }
    ],
    required: true
  },
  {
    label: 'Bucket',
    name: 'bucket',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: 'Domain',
    name: 'domain',
    value: '',
    valueType: 'input',
    required: true
  }
];

export class Qiniu implements ISdk {
  sdkName = '七牛云';
  configurationList = defaultConfigurationList;
  docUrl = 'https://developer.qiniu.com/kodo/sdk/1289/nodejs';
  nowConfigurationList = [] as SdkConfigurationList;

  public async upload(files: string[]): Promise<UploadResponse> {
    const fileExtName = path.extname(files[0]);
    const fileName = uuidv4() + fileExtName;
    const file = createReadStream(files[0]);
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
          desc: 'Qiniu上传失败'
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
      formUploader.putStream(token, fileName, file, putExtra, function(respErr, respBody, respInfo) {
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
    const domain = this.nowConfigurationList.find(item => item.name === 'domain')?.value;
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    return bucketManager.publicDownloadUrl(domain, key);
  }

  protected getConfig() {
    const zone = this.nowConfigurationList.find(item => item.name === 'zone')?.value;
    const config = new qiniu.conf.Config({
      zone: qiniu.zone[zone]
    });
    return config;
  }

  protected getToken() {
    const mac = this.getMac();
    const bucket = this.nowConfigurationList.find(item => item.name === 'bucket')?.value;
    const options = {
      scope: bucket
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(mac);
  }

  protected getMac() {
    const accessKey = this.nowConfigurationList.find(item => item.name === 'accessKey')?.value;
    const secretKey = this.nowConfigurationList.find(item => item.name === 'secretKey')?.value;
    return new qiniu.auth.digest.Mac(accessKey, secretKey);
  }
}
