import { UploaderOptions, UploaderOptionsSpan } from 'aragorn-types';

export const options: UploaderOptions = [
  {
    label: '用户名',
    name: 'owner',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: '仓库名',
    name: 'repo',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: '分支',
    name: 'branch',
    value: 'master',
    valueType: 'input',
    required: true
  },
  {
    label: 'Token',
    name: 'token',
    value: '',
    valueType: 'input',
    span: UploaderOptionsSpan.large,
    required: true
  },
  {
    label: '存放路径',
    name: 'path',
    value: '',
    valueType: 'input',
    desc: '支持路径嵌套，比如 test/img ',
    validationRule: ['domainPath']
  },
  {
    label: '自定义域名',
    name: 'customDomain',
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
    label: 'Jsdelivr CDN',
    name: 'useJsdelivr',
    value: false,
    valueType: 'switch',
    desc: '使用 Jsdeliver CDN 域名替代 Github 原始链接，此时自定义域名无效'
  },
  {
    label: 'Commit Message',
    name: 'message',
    value: 'Uploaded by Aragorn',
    valueType: 'input'
  }
];
