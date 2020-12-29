import { UploaderOptions, UploaderOptionsSpan } from 'aragorn-types';

export const options: UploaderOptions = [
  {
    label: 'PublicKey',
    name: 'public_key',
    value: '',
    valueType: 'input',
    span: UploaderOptionsSpan.large,
    required: true
  },
  {
    label: 'PrivateKey',
    name: 'private_key',
    value: '',
    valueType: 'input',
    span: UploaderOptionsSpan.large,
    required: true
  },
  {
    label: 'Zone',
    name: 'zone',
    value: 'cn-bj',
    valueType: 'select',
    span: UploaderOptionsSpan.small,
    options: [
      {
        label: '北京',
        value: 'cn-bj'
      },
      {
        label: '香港',
        value: 'hk'
      },
      {
        label: '广东',
        value: 'cn-gd'
      },
      {
        label: '上海二',
        value: 'cn-sh2'
      }
    ],
    required: true
  },
  {
    label: 'Bucket',
    name: 'bucket',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: 'Domain',
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
