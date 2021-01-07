import { BaseUploader } from 'aragorn-shared';
import {
  Uploader,
  UploadOptions,
  UploadResponse,
  FileListResponse,
  DeleteFileResponse,
  CreateDirectoryResponse,
  BatchUploadMode,
  UploaderConfig
} from 'aragorn-types';
import fs from 'fs';
import path from 'path';
import axios, { AxiosInstance } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { options as defaultOptions } from './options';

interface Config extends UploaderConfig {
  owner: string;
  repo: string;
  branch: string;
  access_token: string;
  path?: string;
  customDomain?: string;
  message?: string;
  params?: string;
}

export class GiteeUploader extends BaseUploader<Config> implements Uploader {
  name = 'Gitee';
  defaultOptions = defaultOptions.concat(this.commonUploaderOptions.path, this.commonUploaderOptions.params);
  batchUploadMode: BatchUploadMode = 'Sequence';
  tempFiles = [] as { name: string; sha: string }[];
  agent: HttpsProxyAgent | null = null;
  axiosInstance: AxiosInstance = axios.create();

  setConfig(config: Config) {
    this.config = config;
    const { owner, repo } = config;

    this.axiosInstance = axios.create({
      baseURL: `https://gitee.com/api/v5/repos/${owner}/${repo}/contents`,
      headers: {
        'User-Agent': 'Aragorn'
      }
    });
  }

  async upload(options: UploadOptions): Promise<UploadResponse> {
    try {
      const { file, fileName, directoryPath, isFromFileManage } = options;
      const { owner, repo, branch, customDomain, path, message, access_token, params = '' } = this.config;
      let url = '';
      if (isFromFileManage) {
        url = directoryPath ? `/${directoryPath}/${fileName}` : `/${fileName}`;
      } else {
        url = path ? `/${path}/${fileName}` : `/${fileName}`;
      }

      const content = Buffer.isBuffer(file) ? file.toString('base64') : fs.readFileSync(file, { encoding: 'base64' });
      const res = await this.axiosInstance.request({
        url: encodeURI(url),
        method: 'POST',
        data: { message, branch, content, access_token }
      });
      if (res.status === 201) {
        const url =
          encodeURI(
            customDomain
              ? res.data.content.download_url.replace(`https://gitee.com/${owner}/${repo}/raw/${branch}`, customDomain)
              : res.data.content.download_url
          ) + params;
        return {
          success: true,
          data: {
            url
          }
        };
      } else {
        return {
          success: false,
          desc: res.data.message
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
      let { branch, owner, repo, customDomain, access_token, params = '' } = this.config;
      const url = directoryPath ? `/${directoryPath}` : '/';
      const res = await this.axiosInstance.request({
        url: encodeURI(url),
        method: 'GET',
        params: {
          ref: branch,
          access_token
        }
      });
      if (res.status === 200) {
        const directoryData = [] as any[];
        const filesData = res.data.reduce((pre, cur) => {
          if (cur.type === 'dir') {
            cur.type = 'directory';
            directoryData.push(cur);
          } else if (cur.type === 'file') {
            cur.url =
              encodeURI(
                customDomain
                  ? cur.download_url.replace(`https://gitee.com/${owner}/${repo}/raw/${branch}`, customDomain)
                  : cur.download_url
              ) + params;
            pre.push(cur);
          }
          return pre;
        }, []);
        const data = [...directoryData, ...filesData];
        this.tempFiles = data;
        return {
          success: true,
          data
        };
      } else {
        return {
          success: false,
          desc: res.data.message
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
      let { branch, access_token } = this.config;

      const deleteSequence = [] as any[];

      const toDelete = async (filename: string, index: number, deleteSequence: any[]) => {
        let tempName = path.basename(filename);
        const sha = this.tempFiles.find(item => item.name === decodeURI(tempName))?.sha || '';
        if (index > 0) {
          await deleteSequence[index - 1];
        }
        await this.axiosInstance.request({
          url: encodeURI(`/${filename}`),
          method: 'DELETE',
          params: {
            branch,
            message: 'Deleted by Aragorn',
            sha,
            access_token
          }
        });
      };

      const promises = fileNames.map(async (fileName, index) => {
        const res = toDelete(fileName, index, deleteSequence);
        deleteSequence.push(res);
        return res;
      });

      await Promise.all(promises);
      return { success: true };
    } catch (err) {
      return { success: false, desc: err.message };
    }
  }

  async createDirectory(directoryPath: string): Promise<CreateDirectoryResponse> {
    try {
      let { branch, access_token, message } = this.config;
      const content = Buffer.from(`# Directory created by Aragorn`).toString('base64');
      const res = await this.axiosInstance.request({
        url: encodeURI(`/${directoryPath}/README.md`),
        method: 'POST',
        data: {
          access_token,
          message,
          branch,
          content
        }
      });
      if (res.status === 201) {
        return {
          success: true
        };
      } else {
        return {
          success: false,
          desc: res.data.message
        };
      }
    } catch (err) {
      return { success: false, desc: err.message };
    }
  }
}
