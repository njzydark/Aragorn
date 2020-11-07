import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Divider, Select, Space } from 'antd';
import { useAppContext } from '@renderer/context/app';
import { UploaderProfileForm, UploaderProfileFormHandle } from '@renderer/components/UploaderProfileForm';

export const Profile = () => {
  const {
    state: {
      uploaderProfiles,
      configuration: { defaultUploaderProfileId }
    }
  } = useAppContext();

  const { id } = useParams<{ id: string }>();

  const [curUploaderProfileId, setCurUploaderProfileId] = useState('');

  const uploaderProfileFormRef = useRef({} as UploaderProfileFormHandle);

  useEffect(() => {
    const currentId = id || (defaultUploaderProfileId as string);
    handleUploaderProfileChange(currentId);
  }, []);

  const handleUploaderProfileChange = (id: string) => {
    setCurUploaderProfileId(id);
    uploaderProfileFormRef.current.handleUploaderProfilesSelect(id);
  };

  const handleSubmit = () => {
    uploaderProfileFormRef.current.handleSubmit();
  };

  const handleDelete = () => {
    uploaderProfileFormRef.current.handleDelete();
  };

  const handleTest = () => {
    uploaderProfileFormRef.current.handleTest();
  };

  return (
    <div className="profile-page">
      <header>
        <span>上传器配置</span>
        <Divider />
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
      </div>
      <main>
        <UploaderProfileForm ref={uploaderProfileFormRef} />
      </main>
      <footer>
        <Divider />
        <Space>
          <Button type="primary" onClick={handleSubmit}>
            更新配置
          </Button>
          <Button danger onClick={handleDelete}>
            删除
          </Button>
          <Button onClick={handleTest}>测试</Button>
        </Space>
      </footer>
    </div>
  );
};
