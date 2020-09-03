import React, { useContext, useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { Form, Input, Button, Select, message, Switch } from 'antd';
import { AppContext } from '@renderer/app';
import { UploaderProfile } from '@main/uploaderProfileManager';
import { getFormRule } from '@renderer/utils/validationRule';
import { Uploader } from 'aragorn-types';
import './index.less';

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 14 }
};

export const Profile = () => {
  const {
    uploaders,
    uploaderProfiles,
    configuration: { defaultUploaderProfileId }
  } = useContext(AppContext);

  const { id } = useParams<{ id: string }>();

  const [curUploaderProfileId, setCurUploaderProfileId] = useState('');

  const [curUploader, setCurUploader] = useState({} as Uploader);

  const [form] = Form.useForm();

  useEffect(() => {
    const currentId = id || defaultUploaderProfileId;
    setCurrentData(currentId);
  }, []);

  const handleUploaderProfileChange = val => {
    setCurrentData(val);
  };

  const setCurrentData = curId => {
    const uploaderProfile = uploaderProfiles.find(item => item.id === curId);
    if (uploaderProfile) {
      const curUploader = uploaders.find(item => item.name === uploaderProfile.uploaderName);
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
      setCurUploaderProfileId(curId);
      if (curUploader) {
        setCurUploader(curUploader);
      }
    }
  };

  const history = useHistory();

  useEffect(() => {
    function handleUploaderProfileAdd(res) {
      if (res) {
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
        history.push(`/`);
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
        isDefault: false
      };
      ipcRenderer.send('uploader-profile-update', uploaderProfile);
    }
  };

  const handleDelete = () => {
    const id = form.getFieldValue('id');
    ipcRenderer.send('uploader-profile-delete', id);
  };

  return (
    <div className="profile-page">
      <header>
        <h3>上传器配置</h3>
        <hr />
      </header>
      <div className="header-menu">
        <Select
          style={{ minWidth: 120 }}
          value={curUploaderProfileId || '请选择'}
          onChange={handleUploaderProfileChange}
        >
          {uploaderProfiles.map(item => (
            <Select.Option key={item.name} value={item.id}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
        {curUploaderProfileId && (
          <>
            <Button danger onClick={handleDelete} style={{ marginLeft: 'auto' }}>
              删除
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              更新配置
            </Button>
          </>
        )}
      </div>
      <div className="content-wrapper">
        <Form {...formItemLayout} layout="horizontal" form={form} onFinish={handleFinish}>
          <Form.Item name="id" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
          <Form.Item name="uploaderName" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
          {curUploaderProfileId && (
            <Form.Item name="name" label="配置名称" rules={[{ required: true, message: '配置名称不能为空' }]}>
              <Input />
            </Form.Item>
          )}
          {curUploader?.defaultOptions?.map(item => (
            <Form.Item
              key={item.name}
              name={item.name}
              label={item.label}
              rules={[
                { required: item.required, message: `${item.name}不能为空` },
                ...(getFormRule(item.validationRule) as any)
              ]}
              valuePropName={item.valueType === 'switch' ? 'checked' : 'value'}
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
        </Form>
      </div>
    </div>
  );
};
