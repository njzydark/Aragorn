import React, { useContext, useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Divider, Select, Space } from 'antd';
import { AppContext } from '@renderer/app';
import { UploaderProfileForm, UploaderProfileFormHandle } from '@renderer/components/UploaderProfileForm';
import './index.less';

export const Profile = () => {
  const {
    uploaderProfiles,
    configuration: { defaultUploaderProfileId }
  } = useContext(AppContext);

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
        </Space>
      </footer>
    </div>
  );
};
