import React, { useState } from 'react';
import { clipboard, shell, ipcRenderer } from 'electron';
import { Table, message, Popover, Space, Button, Badge, Divider, Dropdown, Menu } from 'antd';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAppContext } from '@renderer/context/app';
import { Plus, Box } from 'react-feather';
import { UploadedFileInfo } from '@main/uploaderManager';
import { CopyOutlined, DeleteOutlined, EllipsisOutlined, UploadOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table/interface';

export const Dashboard = () => {
  const {
    state: {
      uploaderProfiles,
      configuration: { defaultUploaderProfileId },
      uploadedFiles
    }
  } = useAppContext();

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

  const columns: ColumnsType<UploadedFileInfo> = [
    {
      title: '文件名',
      dataIndex: 'name',
      ellipsis: true,
      render: (val, record) => (
        <Popover placement="topLeft" content={() => <img style={{ maxWidth: 500 }} src={record.url} />} trigger="hover">
          <span onClick={() => handleCopy(record.url)} className="row-item">
            {val}
          </span>
        </Popover>
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
      width: 180,
      ellipsis: true,
      render: val => dayjs(val).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      width: 80,
      render: (_, record) => (
        <Space>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item disabled={!record.path} icon={<DeleteOutlined />} onClick={() => handleOpen(record.path)}>
                  打开
                </Menu.Item>
                <Menu.Item disabled={!record.url} icon={<CopyOutlined />} onClick={() => handleCopy(record.url)}>
                  复制链接
                </Menu.Item>
              </Menu>
            }
          >
            <EllipsisOutlined />
          </Dropdown>
        </Space>
      )
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
            {selectRowKeys.length > 0 && (
              <Space style={{ marginBottom: 10 }}>
                <Button icon={<DeleteOutlined />} onClick={handleClear}>
                  清除
                </Button>
                <Button icon={<UploadOutlined />} onClick={handleReUpload}>
                  重新上传
                </Button>
              </Space>
            )}
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
