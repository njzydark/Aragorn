import { UploaderOptions, UploaderOptionsSpan } from 'aragorn-types';

export const options: UploaderOptions = [
  {
    label: 'SecretId',
    name: 'SecretId',
    value: '',
    valueType: 'input',
    span: UploaderOptionsSpan.large,
    required: true
  },
  {
    label: 'SecretKey',
    name: 'SecretKey',
    value: '',
    valueType: 'input',
    span: UploaderOptionsSpan.large,
    required: true
  },
  {
    label: '存储桶名称',
    name: 'Bucket',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: '地域名称',
    name: 'Region',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: '自定义域名',
    name: 'domain',
    value: '',
    valueType: 'input',
    validationRule: ['domain']
  },
  {
    label: 'URL参数',
    name: 'params',
    value: '',
    desc: '会将参数直接拼接到生成的url后面，可以配合对象存储厂商提供的图片处理参数使用，分割符需要手动添加，如 ? !等',
    valueType: 'input'
  },
  {
    label: '存放路径',
    name: 'path',
    value: '',
    valueType: 'input',
    desc: '支持路径嵌套，比如 test/img ',
    validationRule: ['domainPath']
  }
];
