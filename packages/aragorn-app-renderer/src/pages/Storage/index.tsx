import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Select } from 'antd';
import { AppContext } from '@renderer/app';
import { UploaderProfile } from '@main/uploaderProfileManager';
import './index.less';

export const Storage = () => {
  const {
    uploaderProfiles,
    configuration: { defaultUploaderProfileId }
  } = useContext(AppContext);

  const { id } = useParams<{ id: string }>();

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const [uploaderProfile, setUploaderProfile] = useState({} as UploaderProfile);

  const [currentProfileId, setCurrentProfileId] = useState('');

  useEffect(() => {
    const currentId = id || defaultUploaderProfileId;
    setCurrentProfile(currentId);
  }, []);

  const handleUploaderProfileChange = val => {
    setCurrentProfile(val);
  };

  const setCurrentProfile = currentId => {
    const uploaderProfile = uploaderProfiles.find(item => item.id === currentId);
    setUploaderProfile(uploaderProfile as UploaderProfile);
    setCurrentProfileId(currentId as string);
  };

  return (
    <div className="storage-page">
      <header>
        <h3>空间管理</h3>
        <hr />
      </header>
      <div className="header-menu">
        <Select style={{ minWidth: 120 }} value={currentProfileId} onChange={handleUploaderProfileChange}>
          {uploaderProfiles.map(item => (
            <Select.Option key={item.name} value={item.id}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div className="content-wrapper">空间管理</div>
    </div>
  );
};
