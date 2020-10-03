import { UploaderOptions, UploaderOptionsSpan } from 'aragorn-types';

export const options: UploaderOptions = [
  {
    label: 'AccessKey',
    name: 'accessKeyId',
    value: '',
    valueType: 'input',
    span: UploaderOptionsSpan.large,
    required: true
  },
  {
    label: 'AccessSecret',
    name: 'accessKeySecret',
    value: '',
    valueType: 'input',
    span: UploaderOptionsSpan.large,
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
    label: '区域',
    name: 'region',
    value: null,
    valueType: 'select',
    span: UploaderOptionsSpan.small,
    options: [
      {
        value: 'oss-cn-hangzhou',
        label: '中国杭州'
      },
      {
        value: 'oss-cn-shanghai',
        label: '中国上海'
      },
      {
        value: 'oss-cn-qingdao',
        label: '中国青岛'
      },
      {
        value: 'oss-cn-beijing',
        label: '中国北京'
      },
      {
        value: 'oss-cn-shenzhen',
        label: '中国深圳'
      },
      {
        value: 'oss-cn-hongkong',
        label: '中国香港'
      },
      {
        value: 'oss-us-west-1',
        label: '美国硅谷'
      },
      {
        value: 'oss-ap-southeast-1',
        label: '新加坡'
      }
    ],
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
    name: 'endpoint',
    value: '',
    valueType: 'input',
    desc: '自定义域名需要在阿里云控制台进行 Bucket 绑定操作',
    validationRule: ['domain']
  },
  {
    label: '请求者付费',
    name: 'isRequestPay',
    value: false,
    valueType: 'switch'
  },
  {
    label: 'HTTPS',
    name: 'secure',
    value: false,
    valueType: 'switch'
  }
];
