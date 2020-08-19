import { Uploader } from 'aragorn-types';
import { CustomUploader } from 'aragorn-uploader-custom';
import { AliOssUploader } from 'aragorn-uploader-alioss';
import { QiniuUploader } from 'aragorn-uploader-qiniu';
import { UCloudUploader } from 'aragorn-uploader-ucloud';
import { UpyunUploader } from 'aragorn-uploader-upyun';

const alioss = new AliOssUploader();
const qiniu = new QiniuUploader();
const ucloud = new UCloudUploader();
const upyun = new UpyunUploader();
const custom = new CustomUploader();

export class AragornCore {
  protected uploaders: Uploader[];

  constructor() {
    this.uploaders = [alioss, qiniu, ucloud, upyun, custom];
  }

  getUploaderByName(name: string) {
    const uploader = this.uploaders.find(uploader => uploader.name === name);
    return uploader;
  }

  getAllUploaders() {
    return this.uploaders;
  }
}
