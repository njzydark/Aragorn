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
    name: 'access_token',
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
    label: 'Commit Message',
    name: 'message',
    value: 'Uploaded by Aragorn',
    valueType: 'input',
    required: true
  }
];
