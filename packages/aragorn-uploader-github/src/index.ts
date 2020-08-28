import {
  Uploader,
  UploaderOptions,
  UploadResponse,
  FileListResponse,
  DeleteFileResponse,
  CreateDirectoryResponse,
  BatchUploadMode
} from 'aragorn-types';
import fs from 'fs';
import axios from 'axios';
import { options as defaultOptions } from './options';

interface Config {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  path?: string;
  customDomain?: string;
  message?: string;
}

export class GithubUploader implements Uploader {
  name = 'Github';
  defaultOptions = defaultOptions;
  options = defaultOptions;
  batchUploadMode: BatchUploadMode = 'Sequence';
  tempFiles = [] as { name: string; sha: string }[];

  changeOptions(newOptions: UploaderOptions) {
    this.options = newOptions;
  }

  async upload(
    filePath: string,
    fileName: string,
    directoryPath?: string,
    isFromFileManage?: boolean
  ): Promise<UploadResponse> {
    try {
      let { owner, repo, branch, token, customDomain, path, message } = this.getConfig();
      if (customDomain) {
        customDomain = customDomain.replace(/^\/+/, '').replace(/\/+$/, '');
      }
      if (path) {
        path = path.replace(/^\/+/, '').replace(/\/+$/, '');
      }
      let newFileName = '';
      if (isFromFileManage) {
        newFileName = directoryPath ? `/${directoryPath}/${fileName}` : `/${fileName}`;
      } else {
        newFileName = path ? `/${path}/${fileName}` : `/${fileName}`;
      }
      const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents${newFileName}`;
      const content = fs.readFileSync(filePath, { encoding: 'base64' });
      const res = await axios.put(
        baseUrl,
        {
          message,
          branch,
          content
        },
        {
          timeout: 10000,
          headers: {
            Authorization: `token ${token}`
          }
        }
      );
      if (res.status === 201) {
        const url = customDomain
          ? res.data.content.download_url.replace(
              `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`,
              customDomain
            )
          : res.data.content.download_url;
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
      let { owner, repo, branch, token } = this.getConfig();
      const baseUrl = directoryPath
        ? `https://api.github.com/repos/${owner}/${repo}/contents/${directoryPath}?ref=${branch}`
        : `https://api.github.com/repos/${owner}/${repo}/contents?ref=${branch}`;
      const res = await axios.get(baseUrl, {
        timeout: 10000,
        headers: {
          Authorization: `token ${token}`
        }
      });
      if (res.status === 200) {
        const directoryData = [] as any[];
        const filesData = res.data.reduce((pre, cur) => {
          if (cur.type === 'dir') {
            cur.type = 'directory';
            directoryData.push(cur);
          }
          if (cur.type === 'file') {
            cur.url = cur.download_url;
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
      let { owner, repo, branch, token } = this.getConfig();
      const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents/`;
      if (fileNames.length === 1) {
        let tempName = fileNames[0].split('/').pop();
        const sha = this.tempFiles.find(item => item.name === tempName)?.sha || '';
        await axios({
          baseURL: baseUrl + fileNames[0],
          method: 'DELETE',
          timeout: 10000,
          headers: {
            Authorization: `token ${token}`
          },
          data: {
            branch,
            message: '',
            sha
          }
        });
      } else {
        const promises = fileNames.map(async filename => {
          let tempName = filename.split('/').pop();
          const sha = this.tempFiles.find(item => item.name === tempName)?.sha || '';
          return await axios({
            baseURL: baseUrl + filename,
            method: 'DELETE',
            timeout: 10000,
            headers: {
              Authorization: `token ${token}`
            },
            data: {
              branch,
              message: '',
              sha
            }
          });
        });
        await Promise.all(promises);
      }
      return { success: true };
    } catch (err) {
      return { success: false, desc: err.message };
    }
  }

  async createDirectory(directoryPath: string): Promise<CreateDirectoryResponse> {
    try {
      let { owner, repo, branch, token } = this.getConfig();
      const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${directoryPath}/README.md`;
      const content = new Buffer(`# Directory created by Aragorn`).toString('base64');
      const res = await axios.put(
        baseUrl,
        {
          message: '',
          branch,
          content
        },
        {
          timeout: 10000,
          headers: {
            Authorization: `token ${token}`
          }
        }
      );
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

  protected getConfig(): Config {
    const config = this.options.reduce((pre, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {});
    return config as Config;
  }
}
