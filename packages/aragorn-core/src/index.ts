/* eslint-disable no-param-reassign */
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Uploader } from 'aragorn-types';
import { CustomUploader } from 'aragorn-uploader-custom';
import { AliOssUploader } from 'aragorn-uploader-alioss';
import { TencentCosUploader } from 'aragorn-uploader-tencentcos';
import { QiniuUploader } from 'aragorn-uploader-qiniu';
import { UCloudUploader } from 'aragorn-uploader-ucloud';
import { UpyunUploader } from 'aragorn-uploader-upyun';
import { GithubUploader } from 'aragorn-uploader-github';
import { GiteeUploader } from 'aragorn-uploader-gitee';

const alioss = new AliOssUploader();
const tencentcos = new TencentCosUploader();
const qiniu = new QiniuUploader();
const ucloud = new UCloudUploader();
const upyun = new UpyunUploader();
const github = new GithubUploader();
const gitee = new GiteeUploader();
const custom = new CustomUploader();

export class AragornCore {
  protected uploaders: Uploader[];

  constructor() {
    this.uploaders = [alioss, tencentcos, qiniu, ucloud, upyun, github, gitee, custom];
  }

  getUploaderByName(name: string) {
    const uploader = this.uploaders.find(uploader => uploader.name === name);
    return uploader;
  }

  getAllUploaders() {
    return this.uploaders;
  }

  getFileNameByFormat(filePath: string, rename = false, renameFormat = '', isFromFileManage = false) {
    const fileExtName = path.extname(filePath);
    const fileName = path.basename(filePath, fileExtName);
    const uuid = uuidv4().replace(/-/g, '');

    if (!rename || !renameFormat) {
      return fileName + fileExtName;
    }

    function dateFormat(val: number) {
      return val < 10 ? '0' + val : val;
    }

    const date = new Date();

    const data = {
      fileName,
      fileExtName: fileExtName.replace('.', ''),
      uuid,
      year: date.getFullYear(),
      month: dateFormat(date.getMonth() + 1),
      day: dateFormat(date.getDate()),
      hour: dateFormat(date.getHours()),
      minute: dateFormat(date.getMinutes()),
      second: dateFormat(date.getSeconds())
    };

    renameFormat.match(/\{[^\}]*\}/g)?.forEach(item => {
      const itemReg = new RegExp(item);
      if (item.includes('uuid')) {
        const count = Number(item.replace(/(\{)|(\})/g, '').split(':')[1]) || 32;
        renameFormat = renameFormat.replace(itemReg, data.uuid.substring(0, count));
      } else {
        renameFormat = renameFormat.replace(itemReg, data[item.replace(/(\{)|(\})/g, '')] || '');
      }
    });

    let formatfileName = renameFormat + fileExtName;

    if (isFromFileManage) {
      formatfileName = path.basename(formatfileName);
    }

    return formatfileName;
  }
}
