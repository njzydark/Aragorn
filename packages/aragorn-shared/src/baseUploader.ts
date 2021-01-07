import { UploaderConfig, UploaderOption } from 'aragorn-types';
import { createReadStream } from 'fs';
import { Readable } from 'stream';

type CommonUploaderOptions = {
  path: UploaderOption;
  params: UploaderOption;
};

const commonUploaderOptions: CommonUploaderOptions = {
  path: {
    label: '存放路径',
    name: 'path',
    value: '',
    valueType: 'input',
    desc: '支持路径嵌套，比如 test/img',
    validationRule: ['domainPath']
  },
  params: {
    label: 'URL参数',
    name: 'params',
    value: '',
    desc: '会将参数直接拼接到生成的url后面，可以配合对象存储厂商提供的图片处理参数使用，分割符需要手动添加，如 ? !等',
    valueType: 'input'
  }
};

export abstract class BaseUploader<T extends UploaderConfig> {
  config = {} as T;
  commonUploaderOptions: CommonUploaderOptions = commonUploaderOptions;

  setConfig(config: T) {
    this.config = config;
  }

  protected getStream(file: string | Buffer) {
    if (Buffer.isBuffer(file)) {
      return new Readable({
        read() {
          this.push(file);
          this.push(null);
        }
      });
    } else {
      return createReadStream(file);
    }
  }
}
