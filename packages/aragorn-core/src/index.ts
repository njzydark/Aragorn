import { Uploader } from 'aragorn-types';
import { CustomUploader } from 'aragorn-uploader-custom';
import { AliOssUploader } from 'aragorn-uploader-alioss';
import { TencentCosUploader } from 'aragorn-uploader-tencentcos';
import { QiniuUploader } from 'aragorn-uploader-qiniu';
import { UCloudUploader } from 'aragorn-uploader-ucloud';
import { UpyunUploader } from 'aragorn-uploader-upyun';
import { GithubUploader } from 'aragorn-uploader-github';

const alioss = new AliOssUploader();
const tencentcos = new TencentCosUploader();
const qiniu = new QiniuUploader();
const ucloud = new UCloudUploader();
const upyun = new UpyunUploader();
const github = new GithubUploader();
const custom = new CustomUploader();

export class AragornCore {
  protected uploaders: Uploader[];

  constructor() {
    this.uploaders = [alioss, tencentcos, qiniu, ucloud, upyun, github, custom];
  }

  getUploaderByName(name: string) {
    const uploader = this.uploaders.find(uploader => uploader.name === name);
    return uploader;
  }

  getAllUploaders() {
    return this.uploaders;
  }
}
