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
    required: true,
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
