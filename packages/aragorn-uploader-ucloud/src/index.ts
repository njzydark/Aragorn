import { Uploader, UploaderOptions, UploadOptions, UploadResponse } from 'aragorn-types';
import { createReadStream, ReadStream } from 'fs';
import mime from 'mime-types';
import crypto from 'crypto';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import FormData from 'form-data';
import { options as defaultOptions } from './options';

interface Config {
  public_key: string;
  private_key: string;
  zone: string;
  bucket: string;
  domain: string;
  path?: string;
}

export class UCloudUploader implements Uploader {
  name = 'UCloud';
  docUrl = 'https://docs.ucloud.cn/ufile/README';
  defaultOptions = defaultOptions;
  options = defaultOptions;

  changeOptions(newOptions: UploaderOptions) {
    this.options = newOptions;
  }

  async upload(options: UploadOptions): Promise<UploadResponse> {
    const { file, fileName } = options;
    const fileStream = Buffer.isBuffer(file) ? file : createReadStream(file);
    const { domain } = this.getConfig();
    try {
      const res = await this.postFile(fileName, fileStream);
      if (res.status === 200) {
        return {
          success: true,
          data: {
            url: domain + '/' + fileName
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
    const mimeType = mime.lookup(key);
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
    return Buffer.from(content).toString('base64');
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

  protected postFile(fileName: string, file: ReadStream | Buffer) {
    const { zone, bucket } = this.getConfig();
    const token = this.getToken(fileName);

    return new Promise<AxiosResponse>((resolve, reject) => {
      const formData = new FormData();
      formData.append('Authorization', token);
      formData.append('FileName', fileName);
      formData.append('file', file, {
        filename: fileName
      });
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
