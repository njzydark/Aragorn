import { UploaderOptions, UploaderOptionsSpan } from 'aragorn-types';

export const options: UploaderOptions = [
  {
    label: 'API地址',
    name: 'url',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: 'Token',
    name: 'token',
    value: '',
    valueType: 'input',
    desc: '添加到 Header Authorization 中',
    span: UploaderOptionsSpan.large
  },
  {
    label: '请求方式',
    name: 'method',
    value: 'POST',
    valueType: 'select',
    span: UploaderOptionsSpan.small,
    options: [
      {
        label: 'POST',
        value: 'POST'
      },
      {
        label: 'GET',
        value: 'GET'
      },
      {
        label: 'PUT',
        value: 'PUT'
      },
      {
        label: 'PATCH',
        value: 'PATCH'
      },
      {
        label: 'DELETE',
        value: 'DELETE'
      }
    ],
    required: true
  },
  {
    label: 'Content-Type',
    name: 'contentType',
    value: 'multipart/form-data',
    valueType: 'select',
    options: [
      {
        label: 'multipart/form-data',
        value: 'multipart/form-data'
      },
      {
        label: 'application/x-www-form-urlencoded',
        value: 'application/x-www-form-urlencoded'
      },
      {
        label: 'application/json',
        value: 'application/json'
      }
    ],
    required: true
  },
  {
    label: '上传文件字段名',
    name: 'fileFieldName',
    value: 'file',
    valueType: 'input',
    desc: 'form-data 上传时的 file 字段名称',
    span: UploaderOptionsSpan.small,
    required: true
  },
  {
    label: '响应文件字段名',
    name: 'responseUrlFieldName',
    value: 'data.url',
    valueType: 'input',
    desc: '文件 url 在响应数据中对应的字段路径，支持嵌套，比如 data.url',
    span: UploaderOptionsSpan.small,
    required: true
  },
  {
    label: '响应提示字段名',
    name: 'responseMessageName',
    value: 'message',
    valueType: 'input',
    desc: '用于处理上传失败时，获取接口返回的错误消息字段',
    span: UploaderOptionsSpan.small
  },
  {
    label: '请求头参数',
    name: 'requestParams',
    value: '',
    valueType: 'input'
  },
  {
    label: '请求体参数',
    name: 'requestBody',
    value: '',
    valueType: 'input'
  },
  {
    label: 'URL参数',
    name: 'params',
    value: '',
    desc: '会将参数直接拼接到生成的url后面，可以配合对象存储厂商提供的图片处理参数使用，分割符需要手动添加，如 ? !等',
    valueType: 'input'
  }
];
