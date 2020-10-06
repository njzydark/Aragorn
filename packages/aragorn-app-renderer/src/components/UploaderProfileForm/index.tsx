import React, { useState, useEffect, forwardRef, useImperativeHandle, Ref } from 'react';
import { useHistory } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { Form, Input, Select, message, Switch, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { getFormRule } from '@renderer/utils/validationRule';
import { useAppContext } from '@renderer/context/app';
import { Uploader as IUploader, UploaderOptionsSpan } from 'aragorn-types';
import { UploaderProfile } from '@main/uploaderProfileManager';

export interface UploaderProfileFormHandle {
  handleUploaderSelect: (name: string) => void;
  handleUploaderProfilesSelect: (profileId: string) => void;
  handleDelete: () => void;
  handleTest: () => void;
  handleSubmit: () => void;
}

export const UploaderProfileForm = forwardRef((_, ref: Ref<UploaderProfileFormHandle>) => {
  useImperativeHandle(ref, () => ({
    handleUploaderSelect,
    handleUploaderProfilesSelect,
    handleDelete,
    handleTest,
    handleSubmit
  }));

  const {
    state: {
      uploaders,
      uploaderProfiles,
      configuration: { defaultUploaderProfileId }
    }
  } = useAppContext();

  const [curUploader, setCurUploader] = useState({} as IUploader);

  const [form] = Form.useForm();

  const handleUploaderProfilesSelect = (profileId: string) => {
    const uploaderProfile = uploaderProfiles.find(item => item.id === profileId);

    if (!uploaderProfile) {
      console.log(`未找到id为${profileId}的上传器配置`);
      return;
    }

    const curUploader = uploaders.find(item => item.name === uploaderProfile.uploaderName);

    if (!curUploader) {
      console.log(`${uploaderProfile.uploaderName}上传器不存在`);
      return;
    }

    const formInitalValue = curUploader?.defaultOptions.reduce(
      (pre, cur) => {
        const options = uploaderProfile.uploaderOptions.find(item => item.name === cur.name);
        pre[cur.name] = options?.value;
        return pre;
      },
      {
        id: uploaderProfile.id,
        name: uploaderProfile.name,
        uploaderName: uploaderProfile.uploaderName,
        isDefault: uploaderProfile.id === defaultUploaderProfileId
      }
    );

    form.setFieldsValue(formInitalValue as any);

    setCurUploader(curUploader);
  };

  const handleUploaderSelect = (uploaderName: string) => {
    form.resetFields();

    const curUploader = uploaders.find(item => item.name === uploaderName);

    if (!curUploader) {
      console.log(`${uploaderName}上传器不存在`);
      return;
    }

    const formInitalValue = curUploader?.defaultOptions.reduce(
      (pre, cur) => {
        pre[cur.name] = cur.value;
        return pre;
      },
      {
        id: '',
        name: '',
        uploaderName: curUploader.name,
        isDefault: true
      }
    );

    form.setFieldsValue(formInitalValue as any);

    setCurUploader(curUploader);
  };

  const handleSubmit = () => {
    form.submit();
  };

  const handleFinish = (values, isTest = false) => {
    const uploader = uploaders.find(item => item.name === values.uploaderName);

    if (!uploader) {
      console.log(`${values.uploaderName}上传器不存在`);
      return;
    }

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
      isDefault: values.isDefault
    };

    if (isTest) {
      ipcRenderer.send('uploader-profile-test', uploaderProfile);
    } else if (values.id) {
      ipcRenderer.send('uploader-profile-update', uploaderProfile);
    } else {
      ipcRenderer.send('uploader-profile-add', uploaderProfile);
    }
  };

  const handleDelete = () => {
    const id = form.getFieldValue('id');
    ipcRenderer.send('uploader-profile-delete', id);
  };

  const handleTest = () => {
    form.validateFields().then(res => {
      handleFinish(res, true);
    });
  };

  const history = useHistory();

  useEffect(() => {
    function handleUploaderProfileAdd(_, res) {
      if (res) {
        history.push('/');
        message.success('上传器配置添加成功');
      }
    }

    function handleUploaderProfileUpdate(_, res) {
      if (res) {
        message.success('上传器配置更新成功');
      }
    }

    function handleUploaderProfileDelete(_, res) {
      if (res) {
        history.push(`/`);
        message.success('上传器配置删除成功');
      }
    }

    function handleUploaderProfileTest(_, res) {
      if (res) {
        message.success('测试成功，配置填写正确');
      } else {
        message.error('测试失败，请检查配置是否填写正确');
      }
    }

    ipcRenderer.on('uploader-profile-add-reply', handleUploaderProfileAdd);
    ipcRenderer.on('uploader-profile-update-reply', handleUploaderProfileUpdate);
    ipcRenderer.on('uploader-profile-delete-reply', handleUploaderProfileDelete);
    ipcRenderer.on('uploader-profile-test-reply', handleUploaderProfileTest);

    return () => {
      ipcRenderer.removeListener('uploader-profile-add-reply', handleUploaderProfileAdd);
      ipcRenderer.removeListener('uploader-profile-update-reply', handleUploaderProfileUpdate);
      ipcRenderer.removeListener('uploader-profile-delete-reply', handleUploaderProfileDelete);
      ipcRenderer.removeListener('uploader-profile-test-reply', handleUploaderProfileTest);
    };
  }, []);

  return (
    <Form wrapperCol={{ span: UploaderOptionsSpan.middle }} layout="vertical" form={form} onFinish={handleFinish}>
      <Form.Item name="id" style={{ display: 'none' }}>
        <Input />
      </Form.Item>
      <Form.Item name="name" label="配置名称" rules={[{ required: true, message: '配置名称不能为空' }]}>
        <Input placeholder="请输入" />
      </Form.Item>
      <Form.Item name="uploaderName" style={{ display: 'none' }}>
        <Input />
      </Form.Item>
      {curUploader?.options?.map(item => (
        <Form.Item
          wrapperCol={{ span: item.span || UploaderOptionsSpan.middle }}
          key={item.name}
          name={item.name}
          label={
            <Space>
              <span>{item.label}</span>
              {item.desc && (
                <Tooltip title={item.desc}>
                  <QuestionCircleOutlined />
                </Tooltip>
              )}
            </Space>
          }
          rules={[
            { required: item.required, message: `${item.label}不能为空` },
            ...(getFormRule(item.validationRule) as any)
          ]}
          valuePropName={item.valueType === 'switch' ? 'checked' : 'value'}
        >
          {item.valueType === 'input' ? (
            <Input placeholder="请输入" />
          ) : item.valueType === 'select' ? (
            <Select placeholder="请选择">
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
      <Form.Item name="isDefault" label="默认配置" valuePropName="checked">
        <Switch />
      </Form.Item>
    </Form>
  );
});
