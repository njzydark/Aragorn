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
    span: UploaderOptionsSpan.middle,
    options: [
      {
        value: 'oss-cn-hangzhou',
        label: '华东1（杭州）'
      },
      {
        value: 'oss-cn-shanghai',
        label: '华东2（上海）'
      },
      {
        value: 'oss-cn-qingdao',
        label: '华北1（青岛）'
      },
      {
        value: 'oss-cn-beijing',
        label: '华北2（北京）'
      },
      {
        value: 'oss-cn-zhangjiakou',
        label: '华北 3（张家口）'
      },
      {
        value: 'oss-cn-huhehaote',
        label: '华北5（呼和浩特）'
      },
      {
        value: 'oss-cn-wulanchabu',
        label: '华北6（乌兰察布）'
      },
      {
        value: 'oss-cn-shenzhen',
        label: '华南1（深圳）'
      },
      {
        value: 'oss-cn-heyuan',
        label: '华南2（河源）'
      },
      {
        value: 'oss-cn-guangzhou',
        label: '华南3（广州）'
      },
      {
        value: 'oss-cn-chengdu',
        label: '西南1（成都）'
      },
      {
        value: 'oss-cn-hongkong',
        label: '中国（香港）'
      },
      {
        value: 'oss-us-west-1',
        label: '美国西部1（硅谷）'
      },
      {
        value: 'oss-us-east-1',
        label: '美国东部1（弗吉尼亚）'
      },
      {
        value: 'oss-ap-southeast-1',
        label: '亚太东南1（新加坡）'
      },
      {
        value: 'oss-ap-southeast-2',
        label: '亚太东南2（悉尼）'
      },
      {
        value: 'oss-ap-southeast-3',
        label: '亚太东南3（吉隆坡）'
      },
      {
        value: 'oss-ap-southeast-5',
        label: '亚太东南5（雅加达）'
      },
      {
        value: 'oss-ap-northeast-1',
        label: '亚太东北1（日本）'
      },
      {
        value: 'oss-ap-south-1',
        label: '亚太南部1（孟买）'
      },
      {
        value: 'oss-eu-central-1',
        label: '欧洲中部1（法兰克福）'
      },
      {
        value: 'oss-eu-west-1',
        label: '英国（伦敦）'
      },
      {
        value: 'oss-me-east-1',
        label: '中东东部1（迪拜）'
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
    label: 'URL参数',
    name: 'params',
    value: '',
    desc: '会将参数直接拼接到生成的url后面，可以配合对象存储厂商提供的图片处理参数使用，分割符需要手动添加，如 ? !等',
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
