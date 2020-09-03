import { UploaderOptions } from 'aragorn-types';

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
    required: true
  },
  {
    label: '路径',
    name: 'path',
    value: '',
    valueType: 'input'
  },
  {
    label: '自定义域名',
    name: 'customDomain',
    value: '',
    valueType: 'input'
  },
  {
    label: 'Jsdelivr CDN',
    name: 'useJsdelivr',
    value: false,
    valueType: 'switch'
  },
  {
    label: 'Commit Message',
    name: 'message',
    value: 'Uploaded by Aragorn',
    valueType: 'input'
  }
];
