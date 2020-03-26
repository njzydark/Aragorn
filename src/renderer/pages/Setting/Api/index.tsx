import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { Form, Input, Button, Select } from 'antd';
import { AppContext } from '@/renderer/app';
import { IApi } from 'types';

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 14 }
};
const buttonItemLayout = {
  wrapperCol: { span: 14, offset: 8 }
};

export default function Api() {
  const { defaultApi, apiList } = useContext(AppContext);
  const { name } = useParams();
  const [api, setApi] = useState({} as IApi);
  const [form] = Form.useForm();

  useEffect(() => {
    console.log(name);
    if (name) {
      const api = apiList.find(item => item.name === name);
      form.setFieldsValue(api as any);
      setApi(api as IApi);
    } else {
      form.setFieldsValue(defaultApi as any);
      setApi(defaultApi);
    }
  }, [name]);

  const handleFinish = api => {
    if (name) {
      ipcRenderer.send('setting-api-update', api);
    } else {
      ipcRenderer.send('setting-api-add', api);
    }
  };

  const handleDelete = () => {
    // TODO: 需要用id来替代createTime
    const createTime = form.getFieldValue('createTime');
    ipcRenderer.send('setting-api-delete', createTime);
  };

  // TODO: 链接测试
  const handleTest = () => {};

  return (
    <Form {...formItemLayout} layout="horizontal" form={form} initialValues={api} onFinish={handleFinish}>
      <>
        {name && (
          <Form.Item name="createTime" label="createTime" style={{ display: 'none' }}>
            <Input hidden />
          </Form.Item>
        )}
      </>
      <Form.Item name="name" label="API名称" rules={[{ required: true, message: 'API名称不能为空' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="url" label="URL" rules={[{ required: true, message: '上传接口的URL不能为空' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="method" label="Method">
        <Select>
          <Select.Option value="POST">POST</Select.Option>
          <Select.Option value="GET">GET</Select.Option>
          <Select.Option value="PUT">PUT</Select.Option>
          <Select.Option value="PATCH">PATCH</Select.Option>
          <Select.Option value="DELETE">DELETE</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="contentType" label="Content-Type">
        <Select>
          <Select.Option value="multipart/form-data">multipart/form-data</Select.Option>
          <Select.Option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</Select.Option>
          <Select.Option value="application/json">application/json</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="fileFieldName" label="FileFieldName">
        <Input />
      </Form.Item>
      <Form.Item name="requestParams" label="RequestParams">
        <Input />
      </Form.Item>
      <Form.Item name="requestBody" label="RequestBody">
        <Input />
      </Form.Item>
      <Form.Item name="responseUrlFieldName" label="ResponseUrlFieldName">
        <Input />
      </Form.Item>
      <Form.Item {...buttonItemLayout}>
        <Button type="primary" htmlType="submit" style={{ marginRight: 20 }}>
          {name ? '更新' : '保存'}
        </Button>
        <>
          {name && (
            <Button type="danger" htmlType="submit" style={{ marginRight: 20 }} onClick={handleDelete}>
              删除
            </Button>
          )}
        </>
        <Button type="default" onClick={handleTest}>
          测试连接
        </Button>
      </Form.Item>
    </Form>
  );
}
