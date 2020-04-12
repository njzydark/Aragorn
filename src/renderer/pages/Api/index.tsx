import { IApi } from 'types';
import React, { useContext, useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { Form, Input, Button, Select, message } from 'antd';
import { AppContext } from '@/renderer/app';
import './index.less';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 }
};

export default function Api() {
  const { defaultApi, userApiList, setCurMenuKey } = useContext(AppContext);
  const { uuid } = useParams();
  const [api, setApi] = useState({} as IApi);
  const [form] = Form.useForm();

  useEffect(() => {
    if (uuid) {
      const api = userApiList.find(item => item.uuid === uuid);
      form.setFieldsValue(api as any);
      setApi(api as IApi);
    } else {
      form.setFieldsValue(defaultApi as any);
      setApi(defaultApi);
    }
  }, [uuid]);

  const history = useHistory();
  useEffect(() => {
    function handleApiAdd(_, { data }) {
      setCurMenuKey(data.uuid);
      history.push(`/api/${data.uuid}`);
      message.success('API添加成功');
    }
    function handleApiUpdate() {
      message.success('API更新成功');
    }
    function handleApiDelete() {
      setCurMenuKey('api');
      history.push(`/api`);
      message.success('API删除成功');
    }

    ipcRenderer.on('setting-api-add-replay', handleApiAdd);
    ipcRenderer.on('setting-api-update-replay', handleApiUpdate);
    ipcRenderer.on('setting-api-delete-replay', handleApiDelete);

    return () => {
      ipcRenderer.removeListener('setting-api-add-replay', handleApiAdd);
      ipcRenderer.removeListener('setting-api-update-replay', handleApiUpdate);
      ipcRenderer.removeListener('setting-api-delete-replay', handleApiDelete);
    };
  }, []);

  const handleSubmit = () => {
    form.submit();
  };

  const handleFinish = api => {
    if (uuid) {
      ipcRenderer.send('setting-api-update', api);
    } else {
      ipcRenderer.send('setting-api-add', api);
    }
  };

  const handleDelete = () => {
    const uuid = form.getFieldValue('uuid');
    ipcRenderer.send('setting-api-delete', uuid);
  };

  // TODO: 链接测试
  const handleTest = () => {};

  return (
    <div className="api-wrapper">
      <header>
        <h3>自定义API</h3>
        <hr />
      </header>
      <main>
        <Form {...formItemLayout} layout="horizontal" form={form} initialValues={api} onFinish={handleFinish}>
          <>
            {uuid && (
              <Form.Item name="uuid" style={{ display: 'none' }}>
                <Input />
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
        </Form>
      </main>
      <footer>
        <Button type="primary" onClick={handleSubmit} style={{ marginRight: 10 }}>
          保存并应用
        </Button>
        {uuid && (
          <Button type="danger" style={{ marginRight: 10 }} onClick={handleDelete}>
            删除
          </Button>
        )}
        <Button danger onClick={handleTest}>
          测试连接
        </Button>
      </footer>
    </div>
  );
}
