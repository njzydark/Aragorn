import { UserSdk } from 'types';
import React, { useContext, useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { Form, Input, Button, Select, message, Switch } from 'antd';
import { AppContext } from '@/renderer/app';
import './index.less';

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 14 }
};

export default function Sdk() {
  const { sdks, userSdkList, setCurMenuKey } = useContext(AppContext);
  const { uuid } = useParams();
  const [sdk, setSdk] = useState({} as UserSdk);
  const [form] = Form.useForm();

  useEffect(() => {
    if (uuid) {
      const sdk = userSdkList.find(sdk => sdk.uuid === uuid);
      const formInitalValue = sdk?.configurationList.reduce(
        (pre, cur) => {
          pre[cur.name] = cur.value;
          return pre;
        },
        {
          uuid: sdk.uuid,
          name: sdk.name,
          type: 'sdk',
          sdkName: sdk.sdkName
        }
      );
      form.setFieldsValue(formInitalValue as any);
      setSdk(sdk as UserSdk);
    } else {
      form.setFieldsValue({
        name: '',
        sdkName: '',
        isDefault: true
      } as any);
      setSdk({} as any);
    }
  }, [uuid]);

  const history = useHistory();
  useEffect(() => {
    function handleSdkAdd(_, sdk) {
      setCurMenuKey('history');
      history.push('/');
      message.success('SDK添加成功');
    }
    function handleSdkUpdate(res) {
      if (res) {
        message.success('SDK更新成功');
      }
    }
    function handleSdkDelete(res) {
      if (res) {
        setCurMenuKey('sdk');
        history.push(`/sdk`);
        message.success('SDK删除成功');
      }
    }

    ipcRenderer.on('sdk-add-reply', handleSdkAdd);
    ipcRenderer.on('sdk-update-reply', handleSdkUpdate);
    ipcRenderer.on('sdk-delete-reply', handleSdkDelete);

    return () => {
      ipcRenderer.removeListener('sdk-add-reply', handleSdkAdd);
      ipcRenderer.removeListener('sdk-update-reply', handleSdkUpdate);
      ipcRenderer.removeListener('sdk-delete-reply', handleSdkDelete);
    };
  }, []);

  const handleSdkSelect = (sdkName: string) => {
    const sdk = sdks.find(api => api.sdkName === sdkName);
    if (sdk) {
      const formInitalValue = sdk?.configurationList.reduce(
        (pre, cur) => {
          pre[cur.name] = cur.value;
          return pre;
        },
        {
          sdkName: sdk.sdkName,
          type: 'sdk'
        }
      );
      console.log(formInitalValue);
      form.setFieldsValue(formInitalValue as any);
      setSdk(sdk as UserSdk);
    }
  };

  const handleSubmit = () => {
    form.submit();
  };

  const handleFinish = values => {
    const sdk = sdks.find(sdk => sdk.sdkName === values.sdkName);
    if (sdk) {
      const newSdk: UserSdk = JSON.parse(JSON.stringify(sdk));
      const configurationList = newSdk?.configurationList?.map(item => {
        item.value = values[item.name];
        return item;
      });
      newSdk.name = values.name;
      newSdk.type = 'sdk';
      newSdk.sdkName = values.sdkName;
      newSdk.uuid = values.uuid;
      newSdk.configurationList = configurationList;
      if (uuid) {
        ipcRenderer.send('sdk-update', newSdk);
      } else {
        newSdk.isDefault = values.isDefault;
        ipcRenderer.send('sdk-add', newSdk);
      }
    }
  };

  const handleDelete = () => {
    const uuid = form.getFieldValue('uuid');
    ipcRenderer.send('sdk-delete', uuid);
  };

  // TODO: SDK测试
  const handleTest = () => {};

  return (
    <div className="sdk-wrapper">
      <header>
        <h3>配置SDK</h3>
        <hr />
      </header>
      <main>
        <Form {...formItemLayout} layout="horizontal" form={form} initialValues={sdk} onFinish={handleFinish}>
          {uuid && (
            <Form.Item name="uuid" style={{ display: 'none' }}>
              <Input />
            </Form.Item>
          )}
          <Form.Item name="name" label="SDK名称" rules={[{ required: true, message: 'SDK名称不能为空' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sdkName" label="SDK" rules={[{ required: true, message: 'SDK必须选择' }]}>
            <Select onSelect={handleSdkSelect} disabled={uuid !== undefined}>
              {sdks.map(sdk => (
                <Select.Option key={sdk.sdkName} value={sdk.sdkName}>
                  {sdk.sdkName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {sdk?.configurationList?.map(item => (
            <Form.Item
              key={item.name}
              name={item.name}
              label={item.label}
              rules={[{ required: item.required, message: `${item.name}不能为空` }]}
            >
              {item.valueType === 'input' ? (
                <Input />
              ) : item.valueType === 'select' ? (
                <Select>
                  {item.options?.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              ) : null}
            </Form.Item>
          ))}
          {!uuid && (
            <Form.Item name="isDefault" label="默认上传方式" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </main>
      <footer>
        <Button type="primary" onClick={handleSubmit} style={{ marginRight: 10 }}>
          保存并应用
        </Button>
        {uuid && (
          <Button danger style={{ marginRight: 10 }} onClick={handleDelete}>
            删除
          </Button>
        )}
        <Button style={{ marginRight: 10 }} onClick={handleTest}>
          测试连接
        </Button>
      </footer>
    </div>
  );
}
