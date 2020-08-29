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
import { HttpsProxyAgent } from 'https-proxy-agent';
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
  config = {} as Config;
  tempFiles = [] as { name: string; sha: string }[];
  agent: HttpsProxyAgent | null = null;

  changeOptions(newOptions: UploaderOptions, proxy?: string) {
    this.options = newOptions;
    this.config = this.getConfig();
    if (proxy) {
      this.agent = new HttpsProxyAgent(proxy);
    } else {
      this.agent = null;
    }
  }

  async upload(
    filePath: string,
    fileName: string,
    directoryPath?: string,
    isFromFileManage?: boolean
  ): Promise<UploadResponse> {
    try {
      let { owner, repo, branch, token, customDomain, path, message } = this.config;
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
          headers: {
            Authorization: `token ${token}`
          },
          httpsAgent: this.agent
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
      let { owner, repo, branch, token } = this.config;

      const baseUrl = directoryPath
        ? `https://api.github.com/repos/${owner}/${repo}/contents/${directoryPath}?ref=${branch}`
        : `https://api.github.com/repos/${owner}/${repo}/contents?ref=${branch}`;
      const res = await axios.get(baseUrl, {
        headers: {
          Authorization: `token ${token}`
        },
        httpsAgent: this.agent
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
      let { owner, repo, branch, token } = this.config;
      const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents/`;

      const deleteSequence = [] as any[];

      const toDelete = async (filename: string, index: number, deleteSequence: any[]) => {
        let tempName = filename.split('/').pop();
        const sha = this.tempFiles.find(item => item.name === tempName)?.sha || '';
        if (index > 0) {
          await deleteSequence[index - 1];
        }
        await axios({
          baseURL: baseUrl + filename,
          method: 'DELETE',
          headers: {
            Authorization: `token ${token}`
          },
          httpsAgent: this.agent,
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
      let { owner, repo, branch, token } = this.config;
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
          headers: {
            Authorization: `token ${token}`
          },
          httpsAgent: this.agent
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
