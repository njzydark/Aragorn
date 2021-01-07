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
    label: '自定义域名',
    name: 'customDomain',
    value: '',
    valueType: 'input',
    validationRule: ['domain']
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
