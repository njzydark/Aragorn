import React, { useContext } from 'react';
import { clipboard, shell, ipcRenderer } from 'electron';
import { Table, message, Popover } from 'antd';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
import { AppContext } from '@renderer/app';
import PlusIcon from '../../assets/plus.png';
import NewProfileIcon from '../../assets/newProfile.svg';
import './index.less';

export const Dashboard = () => {
  const {
    uploaderProfiles,
    configuration: { defaultUploaderProfileId },
    uploadedFiles
  } = useContext(AppContext);

  const history = useHistory();

  const handleProfileAdd = () => {
    history.push('/uploader');
  };

  const handleProfileClick = item => {
    history.push(`/profile/${item.id}`);
  };

  const handleCopy = url => {
    clipboard.writeText(url);
    message.success('已复制到粘贴板');
  };

  const handleOpen = path => {
    shell.showItemInFolder(path);
  };

  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      ellipsis: true
    },
    {
      title: 'URL',
      dataIndex: 'url',
      ellipsis: true,
      render: val => (
        <Popover placement="topLeft" content={() => <img style={{ maxWidth: 500 }} src={val} />} trigger="hover">
          <span onClick={() => handleCopy(val)} className="row-item">
            {val}
          </span>
        </Popover>
      )
    },
    {
      title: '路径',
      dataIndex: 'path',
      ellipsis: true,
      render: val => (
        <span onClick={() => handleOpen(val)} className="row-item">
          {val}
        </span>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      ellipsis: true,
      width: 120
    },
    {
      title: '上传时间',
      dataIndex: 'date',
      ellipsis: true,
      render: val => dayjs(val).format('YYYY-MM-DD HH:mm:ss')
    }
  ];

  console.log(uploadedFiles);

  return (
    <div className="dashboard-page">
      <header>
        <h3>控制台</h3>
        <hr />
      </header>
      <div className="main-content">
        <div className="profile-wrapper">
          <div className="title">上传器配置</div>
          <div className="card-wrapper">
            {uploaderProfiles.map(item => (
              <div
                key={item.id}
                className={item.id === defaultUploaderProfileId ? 'card card-active' : 'card'}
                onClick={() => handleProfileClick(item)}
              >
                <img src={NewProfileIcon} />
                <span>{item.name}</span>
              </div>
            ))}
            <div className="card" onClick={handleProfileAdd}>
              <img src={PlusIcon} />
            </div>
          </div>
        </div>
        <div className="history-wrapper">
          <div className="title">最近上传</div>
          <div className="card-wrapper">
            <Table size="small" rowKey="name" dataSource={uploadedFiles} columns={columns} pagination={false} />
          </div>
        </div>
      </div>
    </div>
  );
};
