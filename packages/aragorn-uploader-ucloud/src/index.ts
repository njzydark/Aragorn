import { Uploader, UploaderOptions } from 'aragorn-types';
import path from 'path';
import { ReadStream, createReadStream } from 'fs';
import crypto from 'crypto';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import FormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';
import { options as defaultOptions } from './options';

interface Config {
  public_key: string;
  private_key: string;
  zone: string;
  bucket: string;
  domain: string;
}

export class UCloudUploader implements Uploader {
  name = 'UCloud';
  docUrl = 'https://docs.ucloud.cn/ufile/README';
  defaultOptions = defaultOptions;
  options = defaultOptions;

  changeOptions(newOptions: UploaderOptions) {
    this.options = newOptions;
  }

  public async upload(files: string[]) {
    const fileExtName = path.extname(files[0]);
    const fileName = uuidv4() + fileExtName;
    const file = createReadStream(files[0]);
    const { domain } = this.getConfig();
    try {
      const res = await this.postFile(fileName, file);
      if (res.status === 200) {
        return {
          success: true,
          desc: '上传成功',
          data: {
            name: fileName,
            url: domain + '/' + fileName
          }
        };
      } else {
        return {
          success: false,
          desc: 'UCloud上传失败'
        };
      }
    } catch (err) {
      return {
        success: false,
        desc: err.message
      };
    }
  }

  protected getConfig(): Config {
    const config = this.options.reduce((pre, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {});
    return config as Config;
  }

  protected getToken(key: string) {
    const { public_key, private_key, bucket } = this.getConfig();

    const httpMethod = 'POST';
    const content_md5 = '';
    const mimeType = 'image/jpeg';
    const date = '';
    const canonicalized_ucloudHeaders = this.CanonicalizedUCloudHeaders();
    const canonicalized_resource = this.CanonicalizedResource(bucket, key);

    const string_to_sign =
      httpMethod +
      '\n' +
      content_md5 +
      '\n' +
      mimeType +
      '\n' +
      date +
      '\n' +
      canonicalized_ucloudHeaders +
      canonicalized_resource;
    const signature = this.Sign(private_key, string_to_sign);

    return this.Authorize(public_key, signature);
  }

  protected CanonicalizedResource(bucket: string, key: string) {
    return '/' + bucket + '/' + key;
  }

  protected CanonicalizedUCloudHeaders() {
    return '';
  }

  protected Sign(ucloud_private_key: string, string_to_sign: string) {
    return this.Base64(this.HmacSha1(ucloud_private_key, string_to_sign));
  }

  protected Base64(content: Buffer) {
    return new Buffer(content).toString('base64');
  }

  protected HmacSha1(secretKey: string, content: string) {
    const hmac = crypto.createHmac('sha1', secretKey);
    hmac.update(content);
    return hmac.digest();
  }

  protected Authorize(ucloud_public_key: string, signature: string) {
    // eslint-disable-next-line no-useless-concat
    return 'UCloud' + ' ' + ucloud_public_key + ':' + signature;
  }

  protected postFile(fileName: string, file: ReadStream) {
    const { zone, bucket } = this.getConfig();
    const token = this.getToken(fileName);

    return new Promise<AxiosResponse>((resolve, reject) => {
      const formData = new FormData();
      formData.append('Authorization', token);
      formData.append('FileName', fileName);
      formData.append('file', file);
      formData.getLength(async (err, length) => {
        if (err) {
          console.log('content-length 获取失败');
          reject(new Error('content-length 获取失败'));
        } else {
          try {
            const requestOpetion: AxiosRequestConfig = {
              url: `http://${bucket}.${zone}.ufileos.com`,
              method: 'POST',
              headers: {
                ...formData.getHeaders(),
                'Content-Length': length
              },
              data: formData
            };
            // 发起请求
            const res = await axios(requestOpetion);
            resolve(res);
          } catch (err) {
            console.log('上传失败', err.message);
            reject(err);
          }
        }
      });
    });
  }
}
