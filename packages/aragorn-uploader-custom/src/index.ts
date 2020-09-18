import { Uploader, UploaderOptions, UploadOptions, UploadResponse } from 'aragorn-types';
import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { options as defaultOptions } from './options';

interface Config {
  url: string;
  method: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';
  contentType: 'multipart/form-data' | 'application/x-www-form-urlencoded' | 'application/json';
  token?: string;
  fileFieldName: string;
  responseUrlFieldName: string;
  responseMessageName?: string;
  requestParams?: string;
  requestBody?: string;
}

export class CustomUploader implements Uploader {
  name = '自定义';
  defaultOptions = defaultOptions;
  options = defaultOptions;

  changeOptions(newOptions: UploaderOptions) {
    this.options = newOptions;
  }

  async upload(options: UploadOptions): Promise<UploadResponse> {
    try {
      const { file, fileName } = options;
      const formData = new FormData();
      const uploaderOptions = this.getConfig();
      const fileStream = Buffer.isBuffer(file) ? file : createReadStream(file);
      formData.append(uploaderOptions.fileFieldName, fileStream, { filename: fileName });
      const length = await new Promise((resolve, reject) => {
        formData.getLength(async (err, length) => {
          if (err) {
            reject(err);
          } else {
            resolve(length);
          }
        });
      });
      const requestOpetion: AxiosRequestConfig = {
        url: uploaderOptions.url,
        method: uploaderOptions.method,
        headers: {
          ...formData.getHeaders(),
          'Content-Length': length,
          Authorization: uploaderOptions.token || ''
        },
        params: uploaderOptions.requestParams ? JSON.parse(uploaderOptions.requestParams) : {},
        data: uploaderOptions.contentType === 'multipart/form-data' ? formData : uploaderOptions.requestBody
      };
      // 发起请求
      const { data: res } = await axios(requestOpetion);
      let imageUrl = uploaderOptions.responseUrlFieldName?.split('.').reduce((pre, cur) => {
        try {
          return pre[cur];
        } catch (err) {
          return undefined;
        }
      }, res);
      if (imageUrl) {
        return {
          success: true,
          data: {
            url: imageUrl
          }
        };
      } else {
        const message = uploaderOptions?.responseMessageName?.split('.').reduce((pre, cur) => {
          try {
            return pre[cur];
          } catch (err) {
            return undefined;
          }
        }, res);
        return {
          success: false,
          desc: message || '上传失败'
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
}
