import React, { useContext, useState, useEffect, useRef } from 'react';
import { Button, Space, Divider } from 'antd';
import { AppContext } from '@renderer/app';
import { UploaderProfileForm, UploaderProfileFormHandle } from '@renderer/components/UploaderProfileForm';
import './index.less';

export const Uploader = () => {
  const { uploaders } = useContext(AppContext);

  const [curName, setCurName] = useState('');

  const uploaderProfileFormRef = useRef({} as UploaderProfileFormHandle);

  useEffect(() => {
    if (uploaders.length > 0) {
      handleUploaderSelect(uploaders[0].name);
    }
  }, [uploaders]);

  const handleUploaderSelect = (name: string) => {
    setCurName(name);
    uploaderProfileFormRef.current.handleUploaderSelect(name);
  };

  const handleSubmit = () => {
    uploaderProfileFormRef.current.handleSubmit();
  };

  const handleTest = () => {
    uploaderProfileFormRef.current.handleTest();
  };

  return (
    <div className="uploader-page">
      <div className="side-wrapper">
        <div className="title">上传器</div>
        <div className="list">
          {uploaders.map(item => (
            <div
              key={item.name}
              className={item.name === curName ? 'item item-active' : 'item'}
              onClick={() => handleUploaderSelect(item.name)}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
      <div className="content-wrapper">
        <header>
          <span>配置上传器</span>
          <Divider />
        </header>
        <main>
          <UploaderProfileForm ref={uploaderProfileFormRef} />
        </main>
        <footer>
          <Divider />
          <Space>
            <Button type="primary" onClick={handleSubmit}>
              保存配置
            </Button>
            <Button onClick={handleTest}>测试</Button>
          </Space>
        </footer>
      </div>
    </div>
  );
};
