import React, { useContext, useState } from 'react';
import { clipboard, shell, ipcRenderer } from 'electron';
import { Table, message, Popover, Space, Button, Badge, Divider } from 'antd';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
import { AppContext } from '@renderer/app';
import { Plus, Box } from 'react-feather';
import { UploadedFileInfo } from '@main/uploaderManager';
import './index.less';

export const Dashboard = () => {
  const {
    uploaderProfiles,
    configuration: { defaultUploaderProfileId },
    uploadedFiles
  } = useContext(AppContext);

  const history = useHistory();

  const [selectRowKeys, setRowKeys] = useState([]);
  const [selectRows, setSelectRows] = useState([] as UploadedFileInfo[]);

  const handleProfileAdd = () => {
    history.push('/uploader');
  };

  const handleProfileClick = id => {
    if (id === defaultUploaderProfileId) {
      history.push(`/profile/${id}`);
    } else {
      ipcRenderer.send('set-default-uploader-profile', id);
    }
  };

  const handleCopy = url => {
    clipboard.writeText(url);
    message.success('已复制到粘贴板');
  };

  const handleOpen = path => {
    shell.showItemInFolder(path);
  };

  const handleTableRowChange = (selectedRowKeys, selectedRows) => {
    setRowKeys(selectedRowKeys);
    setSelectRows(selectedRows);
  };

  const handleClear = () => {
    const ids = selectRows.map(item => item.id);
    ipcRenderer.send('clear-upload-history', ids);
    setRowKeys([]);
  };

  const handleReUpload = () => {
    const data = selectRows.map(item => {
      return { id: item.uploaderProfileId, path: item.path };
    });
    ipcRenderer.send('file-reupload', data);
    setRowKeys([]);
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
      title: '上传器配置',
      dataIndex: 'uploaderProfileId',
      ellipsis: true,
      width: 120,
      render: val => (
        <a onClick={() => handleProfileClick(val)}>
          {uploaderProfiles.find(item => item.id === val)?.name || '未找到'}
        </a>
      )
    },
    {
      title: '状态',
      dataIndex: 'url',
      ellipsis: true,
      width: 80,
      render: val => (
        <>
          <Badge status={val ? 'success' : 'error'} />
          {val ? '成功' : '失败'}
        </>
      )
    },
    {
      title: '上传时间',
      dataIndex: 'date',
      width: 200,
      ellipsis: true,
      render: val => dayjs(val).format('YYYY-MM-DD HH:mm:ss')
    }
  ];

  return (
    <div className="dashboard-page">
      <header>
        <span>控制台</span>
        <Divider />
      </header>
      <main>
        <div className="profile-wrapper">
          <div className="title">上传器配置</div>
          <div className="card-wrapper">
            {uploaderProfiles.map(item => (
              <div
                key={item.id}
                className={item.id === defaultUploaderProfileId ? 'card card-active' : 'card'}
                onClick={() => handleProfileClick(item.id)}
              >
                <Box className="card-icon" />
                <span>{item.name}</span>
              </div>
            ))}
            <div className="card" onClick={handleProfileAdd}>
              <Plus className="card-icon" />
            </div>
          </div>
        </div>
        <div className="history-wrapper">
          <div className="title">最近上传</div>
          <div className="card-wrapper">
            <Space style={{ marginBottom: 10 }}>
              <Button disabled={selectRowKeys.length === 0} onClick={handleClear}>
                清除
              </Button>
              <Button disabled={selectRowKeys.length === 0} onClick={handleReUpload}>
                重新上传
              </Button>
            </Space>
            <Table
              size="small"
              rowKey="id"
              dataSource={uploadedFiles}
              columns={columns}
              rowSelection={{ onChange: handleTableRowChange, selectedRowKeys: selectRowKeys }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
