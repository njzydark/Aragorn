import { BaseUploader } from 'aragorn-shared';
import { Uploader, UploaderConfig, UploadOptions, UploadResponse } from 'aragorn-types';
import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { options as defaultOptions } from './options';

interface Config extends UploaderConfig {
  url: string;
  method: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';
  contentType: 'multipart/form-data' | 'application/x-www-form-urlencoded' | 'application/json';
  token?: string;
  fileFieldName: string;
  responseUrlFieldName: string;
  responseMessageName?: string;
  requestParams?: string;
  requestBody?: string;
  params?: string;
}

export class CustomUploader extends BaseUploader<Config> implements Uploader {
  name = '自定义';
  defaultOptions = defaultOptions.concat(this.commonUploaderOptions.params);

  async upload(options: UploadOptions): Promise<UploadResponse> {
    try {
      const { file, fileName } = options;
      const formData = new FormData();
      const uploaderConfig = this.config;
      const fileStream = Buffer.isBuffer(file) ? file : createReadStream(file);
      formData.append(uploaderConfig.fileFieldName, fileStream, { filename: fileName });
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
        url: uploaderConfig.url,
        method: uploaderConfig.method,
        headers: {
          ...formData.getHeaders(),
          'Content-Length': length,
          Authorization: uploaderConfig.token || ''
        },
        params: uploaderConfig.requestParams ? JSON.parse(uploaderConfig.requestParams) : {},
        data: uploaderConfig.contentType === 'multipart/form-data' ? formData : uploaderConfig.requestBody
      };
      // 发起请求
      const { data: res } = await axios(requestOpetion);
      let imageUrl = uploaderConfig.responseUrlFieldName?.split('.').reduce((pre, cur) => {
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
            url: imageUrl + uploaderConfig.params || ''
          }
        };
      } else {
        const message = uploaderConfig?.responseMessageName?.split('.').reduce((pre, cur) => {
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
}
