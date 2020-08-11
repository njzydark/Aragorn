import React, { useContext, useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { Form, Input, Button, Select, message, Switch } from 'antd';
import { AppContext } from '@renderer/app';
import { UploaderProfile } from '@main/uploaderProfileManager';

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 14 }
};

export default function UploaderProfileComponent() {
  const { uploaders, uploaderProfiles, setCurMenuKey } = useContext(AppContext);
  const { id } = useParams<{ id: string }>();
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const [uploaderProfile, setUploaderProfile] = useState({} as UploaderProfile);
  const [form] = Form.useForm();

  useEffect(() => {
    if (id) {
      const uploaderProfile = uploaderProfiles.find(item => item.id === id);
      const formInitalValue = uploaderProfile?.uploaderOptions.reduce(
        (pre, cur) => {
          pre[cur.name] = cur.value;
          return pre;
        },
        {
          id: uploaderProfile.id,
          name: uploaderProfile.name,
          uploaderName: uploaderProfile.uploaderName
        }
      );
      form.setFieldsValue(formInitalValue as any);
      setUploaderProfile(uploaderProfile as UploaderProfile);
    } else {
      form.setFieldsValue({
        name: '',
        uploaderName: '',
        isDefault: true
      } as any);
      setUploaderProfile({} as any);
    }
  }, [id]);

  const history = useHistory();
  useEffect(() => {
    function handleUploaderProfileAdd(res) {
      if (res) {
        setCurMenuKey('history');
        history.push('/');
        message.success('上传器配置添加成功');
      }
    }
    function handleUploaderProfileUpdate(res) {
      if (res) {
        message.success('上传器配置更新成功');
      }
    }
    function handleUploaderProfileDelete(res) {
      if (res) {
        setCurMenuKey('uploaderProfile');
        history.push(`/uploaderProfile`);
        message.success('上传器配置删除成功');
      }
    }

    ipcRenderer.on('uploader-profile-add-reply', handleUploaderProfileAdd);
    ipcRenderer.on('uploader-profile-update-reply', handleUploaderProfileUpdate);
    ipcRenderer.on('uploader-profile-delete-reply', handleUploaderProfileDelete);

    return () => {
      ipcRenderer.removeListener('uploader-profile-add-reply', handleUploaderProfileAdd);
      ipcRenderer.removeListener('uploader-profile-update-reply', handleUploaderProfileUpdate);
      ipcRenderer.removeListener('uploader-profile-delete-reply', handleUploaderProfileDelete);
    };
  }, []);

  const handleUploaderSelect = (uploaderName: string) => {
    const uploader = uploaders.find(item => item.name === uploaderName);
    if (uploader) {
      const formInitalValue = uploader?.defaultOptions.reduce(
        (pre, cur) => {
          pre[cur.name] = cur.value;
          return pre;
        },
        {
          uploaderName: uploader.name
        }
      );
      console.log(formInitalValue);
      form.setFieldsValue(formInitalValue as any);
      setUploaderProfile(data => ({ ...data, uploaderOptions: uploader.defaultOptions }));
    }
  };

  const handleSubmit = () => {
    form.submit();
  };

  const handleFinish = values => {
    const uploader = uploaders.find(item => item.name === values.uploaderName);
    if (uploader) {
      const uploaderOptions = uploader?.defaultOptions?.map(item => {
        let temp = { ...item };
        temp.value = values[item.name];
        return temp;
      });
      const uploaderProfile: UploaderProfile = {
        id: values.id,
        name: values.name,
        uploaderName: values.uploaderName,
        uploaderOptions,
        isDefault: id ? false : values.isDefault
      };
      if (id) {
        ipcRenderer.send('uploader-profile-update', uploaderProfile);
      } else {
        ipcRenderer.send('uploader-profile-add', uploaderProfile);
      }
    }
  };

  const handleDelete = () => {
    const id = form.getFieldValue('id');
    ipcRenderer.send('uploader-profile-delete', id);
  };

  // TODO: 配置测试
  const handleTest = () => {};

  return (
    <div className="sdk-wrapper">
      <header>
        <h3>上传器配置</h3>
        <hr />
      </header>
      <main>
        <Form {...formItemLayout} layout="horizontal" form={form} onFinish={handleFinish}>
          {id && (
            <Form.Item name="id" style={{ display: 'none' }}>
              <Input />
            </Form.Item>
          )}
          <Form.Item name="name" label="配置名称" rules={[{ required: true, message: '配置名称不能为空' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="uploaderName" label="上传器" rules={[{ required: true, message: '上传器不能为空' }]}>
            <Select onSelect={handleUploaderSelect} disabled={id !== undefined}>
              {uploaders.map(item => (
                <Select.Option key={item.name} value={item.name}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {uploaderProfile?.uploaderOptions?.map(item => (
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
              ) : item.valueType === 'switch' ? (
                <Switch />
              ) : null}
            </Form.Item>
          ))}
          {!id && (
            <Form.Item name="isDefault" label="默认配置" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </main>
      <footer>
        <Button type="primary" onClick={handleSubmit} style={{ marginRight: 10 }}>
          保存并应用
        </Button>
        {id && (
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
