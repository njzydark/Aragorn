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
    label: '存放路径',
    name: 'path',
    value: '',
    valueType: 'input',
    desc: '支持路径嵌套，比如 test/img ',
    validationRule: ['domainPath']
  }
];
