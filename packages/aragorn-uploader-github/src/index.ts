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
import axios, { AxiosInstance } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { options as defaultOptions } from './options';

interface Config extends UploaderConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  path?: string;
  customDomain?: string;
  useJsdelivr?: boolean;
  message?: string;
  params?: string;
  proxy?: string;
}

export class GithubUploader extends BaseUploader<Config> implements Uploader {
  name = 'Github';
  defaultOptions = defaultOptions.concat(this.commonUploaderOptions.path, this.commonUploaderOptions.params);
  batchUploadMode: BatchUploadMode = 'Sequence';
  tempFiles = [] as { name: string; sha: string }[];
  agent: HttpsProxyAgent | null = null;
  axiosInstance: AxiosInstance = axios.create();

  setConfig(config: Config) {
    this.config = config;
    this.agent = config.proxy ? new HttpsProxyAgent(config.proxy) : null;
    const { owner, repo, token } = config;

    this.axiosInstance = axios.create({
      baseURL: `https://api.github.com/repos/${owner}/${repo}/contents`,
      headers: {
        'User-Agent': 'Aragorn',
        Authorization: `token ${token}`
      },
      httpsAgent: this.agent
    });
  }

  async upload(options: UploadOptions): Promise<UploadResponse> {
    try {
      const { file, fileName, directoryPath, isFromFileManage } = options;
      const { owner, repo, branch, customDomain, path, message, useJsdelivr, params = '' } = this.config;
      let url = '';
      if (isFromFileManage) {
        url = directoryPath ? `/${directoryPath}/${fileName}` : `/${fileName}`;
      } else {
        url = path ? `/${path}/${fileName}` : `/${fileName}`;
      }

      const content = Buffer.isBuffer(file) ? file.toString('base64') : fs.readFileSync(file, { encoding: 'base64' });
      const res = await this.axiosInstance.request({
        url: encodeURI(url),
        method: 'PUT',
        data: { message, branch, content }
      });
      if (res.status === 201) {
        let url = customDomain
          ? res.data.content.download_url.replace(
              `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`,
              customDomain
            )
          : useJsdelivr
          ? res.data.content.download_url.replace(
              `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`,
              `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}`
            )
          : res.data.content.download_url;
        url += params;
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
      let { branch, owner, repo, customDomain, useJsdelivr, params = '' } = this.config;
      const url = directoryPath ? `/${directoryPath}?ref=${branch}` : `?ref=${branch}`;
      const res = await this.axiosInstance.request({
        url: encodeURI(url),
        method: 'GET'
      });
      if (res.status === 200) {
        const directoryData = [] as any[];
        const filesData = res.data.reduce((pre, cur) => {
          if (cur.type === 'dir') {
            cur.type = 'directory';
            directoryData.push(cur);
          } else if (cur.type === 'file') {
            cur.url = customDomain
              ? cur.download_url.replace(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}`, customDomain)
              : useJsdelivr
              ? cur.download_url.replace(
                  `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`,
                  `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}`
                )
              : cur.download_url;
            cur.url += params;
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
      let { branch } = this.config;

      const deleteSequence = [] as any[];

      const toDelete = async (filename: string, index: number, deleteSequence: any[]) => {
        let tempName = filename.split('/').pop();
        const sha = this.tempFiles.find(item => item.name === tempName)?.sha || '';
        if (index > 0) {
          await deleteSequence[index - 1];
        }
        await this.axiosInstance.request({
          url: encodeURI(`/${filename}`),
          method: 'DELETE',
          data: {
            branch,
            message: '',
            sha
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
      let { branch } = this.config;
      const content = Buffer.from(`# Directory created by Aragorn`).toString('base64');
      const res = await this.axiosInstance.request({
        url: encodeURI(`/${directoryPath}/README.md`),
        method: 'PUT',
        data: {
          message: '',
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
