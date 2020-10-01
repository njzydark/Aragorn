/* eslint-disable no-template-curly-in-string */
import React, { useContext, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { Row, Col, Form, Input, InputNumber, Button, Select, Radio, Switch, message, Space, Divider } from 'antd';
import { AppContext } from '@renderer/app';
import { domainPathValidationRule } from '@renderer/utils/validationRule';

const platform = window.navigator.platform.toLowerCase();

const inputItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15 }
};
const switchtemLayout = {
  labelCol: { span: 13 },
  wrapperCol: { span: 11 }
};

export const Setting = () => {
  const { configuration, uploaderProfiles } = useContext(AppContext);
  const [form] = Form.useForm();

  useEffect(() => {
    function handleWorkflowCopyReply(_, res) {
      if (res) {
        message.success('右键菜单添加成功');
      } else {
        message.error('右键菜单添加失败');
      }
    }

    function handleInstallCliReply(_, res) {
      if (res) {
        message.success('CLI 安装成功');
      } else {
        message.error('CLI 安装失败');
      }
    }

    ipcRenderer.on('copy-darwin-workflow-reply', handleWorkflowCopyReply);
    ipcRenderer.on('install-cli-reply', handleInstallCliReply);
    return () => {
      ipcRenderer.removeListener('copy-darwin-workflow-reply', handleWorkflowCopyReply);
      ipcRenderer.removeListener('install-cli-reply', handleInstallCliReply);
    };
  }, []);

  const handleSubmit = () => {
    form.submit();
  };

  const handleReset = () => {
    form.resetFields();
  };

  const handleFinish = values => {
    console.log(values);
    ipcRenderer.send('setting-configuration-update', values);
  };

  const handleAddWorkflow = () => {
    ipcRenderer.send('copy-darwin-workflow');
  };

  const handleInstallCli = () => {
    ipcRenderer.send('install-cli');
  };

  return (
    <div className="setting-wrapper">
      <header>
        <span>设置</span>
        <Divider />
      </header>
      <main>
        <Form
          {...switchtemLayout}
          layout="horizontal"
          labelAlign="left"
          form={form}
          initialValues={configuration}
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
            <Col xs={24}>
              <Form.Item name="defaultUploaderProfileId" label="默认上传器配置" {...inputItemLayout}>
                <Select>
                  {uploaderProfiles.map(item => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24}>
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
              <Form.Item name="rename" label="重命名文件" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item
                name="renameFormat"
                wrapperCol={{ span: 18 }}
                rules={[domainPathValidationRule]}
                extra="魔法变量: {fileName} {fileExtName} {uuid:n} {year} {month} {day} {hour} {minute} {second}"
              >
                <Input placeholder="请输入文件命名格式" />
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
          </Row>
          <Row>
            <Col xs={12}>
              <Form.Item name="autoUpdate" label="自动检查更新" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item name="useBetaVersion" label="接收beta版本更新" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Form.Item name="openWebServer" label="WebServer" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item name="webServerPort" label="WebServer 端口">
                <InputNumber min={3001} max={65535} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </main>
      <footer>
        <Divider />
        <Space>
          <Button type="primary" onClick={handleSubmit}>
            保存并应用
          </Button>
          <Button onClick={handleReset}>放弃</Button>
          {platform.includes('mac') && (
            <>
              <Button onClick={handleInstallCli}>安装 CLI</Button>
              <Button onClick={handleAddWorkflow}>添加右键菜单</Button>
            </>
          )}
        </Space>
      </footer>
    </div>
  );
};
