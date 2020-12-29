import { useState } from 'react';
import { clipboard, shell, ipcRenderer } from 'electron';
import { Table, message, Popover, Space, Button, Badge, Image, Divider } from 'antd';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAppContext } from '@renderer/context/app';
import { Plus, Box } from 'react-feather';
import { UploadedFileInfo } from '@main/uploaderManager';
import { CopyOutlined, DeleteOutlined, FolderOpenOutlined, UploadOutlined } from '@ant-design/icons';
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
        <Popover
          placement="topLeft"
          content={() =>
            /(jpg|png|gif|jpeg)$/.test(val) ? (
              <Image
                style={{ maxWidth: 500 }}
                src={record.url}
                fallback="data:image/png;base64,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"
              />
            ) : (
              val
            )
          }
          trigger="hover"
        >
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
          <FolderOpenOutlined onClick={() => handleOpen(record.path)} />
          <CopyOutlined onClick={() => handleCopy(record.url)} />
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
