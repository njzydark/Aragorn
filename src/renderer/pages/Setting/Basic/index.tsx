import React, { useContext } from 'react';
import { ipcRenderer } from 'electron';
import { Row, Col, Form, Input, Button, Select, Radio, Switch } from 'antd';
import { AppContext } from '@/renderer/app';

const inputItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15 }
};
const switchtemLayout = {
  labelCol: { span: 13 },
  wrapperCol: { span: 11 }
};
const buttonItemLayout = {
  wrapperCol: { span: 14, offset: 6 }
};

export default function Basic() {
  const { basic, apiList } = useContext(AppContext);
  const [form] = Form.useForm();

  const handleFinish = values => {
    console.log(values);
    ipcRenderer.send('setting-basic-update', values);
  };

  return (
    <Form
      {...switchtemLayout}
      layout="horizontal"
      labelAlign="left"
      form={form}
      initialValues={basic}
      onFinish={handleFinish}
    >
      <Row>
        <Col xs={24}>
          <Form.Item name="urlType" label="链接格式" {...inputItemLayout}>
            <Radio.Group>
              <Radio.Button value="URL">URL</Radio.Button>
              <Radio.Button value="HTML">HTML</Radio.Button>
              <Radio.Button value="Markdown">Markdown</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Item name="defaultApiName" label="默认图床" {...inputItemLayout}>
            <Select>
              {apiList.map((item, index) => (
                <Select.Option key={index} value={item.name}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Item name="proxy" label="设置代理" {...inputItemLayout}>
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <Form.Item name="autoCopy" label="自动复制" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={12}>
          <Form.Item name="autoRecover" label="自动恢复粘贴板内容" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <Form.Item name="showNotifaction" label="系统通知提示" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={12}>
          <Form.Item name="sound" label="提示音" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <Form.Item name="autoStart" label="开机自启" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={12}>
          <Form.Item name="autoUpdate" label="自动检查更新" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item {...buttonItemLayout}>
        <Button type="primary" htmlType="submit">
          保存
        </Button>
      </Form.Item>
    </Form>
  );
}
