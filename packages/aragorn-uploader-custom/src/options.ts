import { UploaderOptions } from 'aragorn-types';

export const options: UploaderOptions = [
  {
    label: 'API地址',
    name: 'url',
    value: '',
    valueType: 'input',
    required: true
  },
  {
    label: '请求方式',
    name: 'method',
    value: 'POST',
    valueType: 'select',
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
    value: '',
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
    label: '文件字段名',
    name: 'fileFieldName',
    value: 'file',
    valueType: 'input',
    required: true
  },
  {
    label: '响应字段名',
    name: 'responseUrlFieldName',
    value: '',
    valueType: 'input',
    required: true
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
  }
];
