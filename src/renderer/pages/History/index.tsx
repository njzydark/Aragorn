import { UserSdk, IApi } from 'types';
import React, { useContext, useRef } from 'react';
import { clipboard, shell, ipcRenderer } from 'electron';
import dayjs from 'dayjs';
import { useHistory } from 'react-router-dom';
import { message, Empty, Button } from 'antd';
import { AppContext } from '@/renderer/app';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToolbox, faSitemap, faUpload } from '@fortawesome/free-solid-svg-icons';
import './index.less';

export default function History() {
  const { uploadedFiles, userSdkList, userApiList } = useContext(AppContext);
  const isShowAddBtn = uploadedFiles.length === 0 && userSdkList.length === 0 && userApiList.length === 0;
  const isShowUploadBtn = !isShowAddBtn && uploadedFiles.length === 0;

  return (
    <div className="history-wrapper">
      <header>
        <h3>历史记录</h3>
        <hr />
      </header>
      <main>
        {isShowAddBtn && <EmptyUploader />}
        {isShowUploadBtn ? <EmptyHistory /> : <HistoryList />}
      </main>
    </div>
  );
}

function EmptyUploader() {
  const { setCurMenuKey } = useContext(AppContext);
  const history = useHistory();
  function handleJump(menuName: string) {
    setCurMenuKey(menuName);
    history.push(`/${menuName}`);
  }

  return (
    <div className="empty-wrapper">
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无文件上传方式">
        <div className="btn-group">
          <Button
            icon={<FontAwesomeIcon icon={faToolbox} style={{ marginRight: 10 }} />}
            type="primary"
            style={{ marginRight: 20 }}
            onClick={() => handleJump('sdk')}
          >
            添加SDK
          </Button>
          <Button
            icon={<FontAwesomeIcon icon={faSitemap} style={{ marginRight: 10 }} />}
            type="primary"
            onClick={() => handleJump('api')}
          >
            添加API
          </Button>
        </div>
      </Empty>
    </div>
  );
}

function EmptyHistory() {
  const uploadRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.FormEvent<HTMLInputElement>) => {
    const fileList = event.currentTarget.files || [];
    const filesPath = Array.from(fileList).map(file => file.path);
    ipcRenderer.send('file-upload-by-side-menu', filesPath);
    event.currentTarget.value = '';
  };

  function handleUpload() {
    uploadRef.current?.click();
  }

  return (
    <div className="empty-wrapper">
      <Empty description="暂无文件上传历史">
        <div className="btn-group">
          <Button
            icon={<FontAwesomeIcon icon={faUpload} style={{ marginRight: 10 }} />}
            type="primary"
            onClick={handleUpload}
          >
            去上传
          </Button>
          <input ref={uploadRef} type="file" multiple hidden onChange={handleFileUpload} />
        </div>
      </Empty>
    </div>
  );
}

function HistoryList() {
  const { uploadedFiles, userSdkList, userApiList, setCurMenuKey } = useContext(AppContext);
  const history = useHistory();

  function getUploaderName(uuid: string) {
    const uploader = [...userSdkList, ...userApiList].find(item => item.uuid === uuid);
    return uploader?.name || '-';
  }

  function handleUrlClick(url: string) {
    clipboard.writeText(url);
    message.success('已复制到粘贴板');
  }

  function handlePathClick(path: string) {
    shell.showItemInFolder(path);
  }

  function handleUploaderClick(uploader: UserSdk | IApi) {
    setCurMenuKey(uploader.uuid as string);
    history.push(`/${uploader.type}/${uploader.uuid}`);
  }

  return (
    <>
      {uploadedFiles.map(item => (
        <div className="list-item" key={item.name}>
          <div className="info">
            <div className="title" onClick={() => handleUrlClick(item.url as string)}>
              {item.url}
            </div>
            <div className="desc" title={item.name}>
              <span className="desc-title">文件名：</span>
              <span className="desc-content">{item.name}</span>
            </div>
            <div className="desc desc-path" title={item.path} onClick={() => handlePathClick(item.path)}>
              <span className="desc-title">路径：</span>
              <span className="desc-content">{item.path}</span>
            </div>
            <div className="desc">
              <span className="desc-title">类型：</span>
              <span className="desc-content">{item.type}</span>
            </div>
            <div className="desc desc-uploader" onClick={() => handleUploaderClick(item.uploader)}>
              <span className="desc-title">上传方式：</span>
              <span className="desc-content">{getUploaderName(item.uploader.uuid as string)}</span>
            </div>
            <div className="desc">
              <span className="desc-title">上传时间：</span>
              <span className="desc-content">{dayjs(item.date).format('YYYY-MM-DD HH:mm:ss')}</span>
            </div>
          </div>
          {item?.type?.includes('image') && (
            <div className="img">
              <img src={item.url} />
            </div>
          )}
        </div>
      ))}
    </>
  );
}
