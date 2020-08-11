import { UploaderOptions } from 'aragorn-types';

export const options: UploaderOptions = [
  {
    label: '服务名称',
    name: 'serviceName',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: '操作员',
    name: 'operatorName',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: '操作员密码',
    name: 'operatorPassword',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: '域名',
    name: 'domain',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: '文件存放目录',
    name: 'directory',
    value: '',
    valueType: 'input'
  }
];
