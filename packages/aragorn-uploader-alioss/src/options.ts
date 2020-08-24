import { UploaderOptions } from 'aragorn-types';

export const options: UploaderOptions = [
  {
    label: 'AccessKey',
    name: 'accessKeyId',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: 'AccessSecret',
    name: 'accessKeySecret',
    value: '',
    valueType: 'input',
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
    value: '',
    valueType: 'select',
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
    label: '自定义域名',
    name: 'endpoint',
    value: '',
    valueType: 'input'
  },
  {
    label: '文件存放目录',
    name: 'directory',
    value: '',
    valueType: 'input'
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
