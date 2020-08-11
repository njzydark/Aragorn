import { Uploader, UploaderOptions } from 'aragorn-types';
import { createReadStream } from 'fs';
import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';
import { options as defaultOptions } from './options';

interface Config {
  url: string;
  method: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';
  contentType: 'multipart/form-data' | 'application/x-www-form-urlencoded' | 'application/json';
  fileFieldName: string;
  responseUrlFieldName: string;
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

  async upload(files: string[]) {
    try {
      const file = files[0];
      const formData = new FormData();
      const uploaderOptions = this.getConfig();
      formData.append(uploaderOptions.fileFieldName, createReadStream(file));
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
          'Content-Length': length
        },
        params: uploaderOptions.requestParams ? JSON.parse(uploaderOptions.requestParams) : {},
        data: uploaderOptions.contentType === 'multipart/form-data' ? formData : uploaderOptions.requestBody
      };
      // 发起请求
      const { data: res } = await axios(requestOpetion);
      let imageUrl = res?.data?.[uploaderOptions.responseUrlFieldName];
      if (imageUrl) {
        return {
          success: true,
          desc: '上传成功',
          data: {
            name: uuidv4(),
            url: imageUrl
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
}
