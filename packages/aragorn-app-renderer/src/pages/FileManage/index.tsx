import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { clipboard, ipcRenderer } from 'electron';
import { Select, Table, message, Space, Button, Breadcrumb, Modal, Form, Input, Divider } from 'antd';
import {
  FileOutlined,
  FolderFilled,
  DeleteOutlined,
  DownloadOutlined,
  CopyOutlined,
  ReloadOutlined,
  FolderAddOutlined,
  UploadOutlined
} from '@ant-design/icons';
import filesize from 'filesize';
import dayjs from 'dayjs';
import { useAppContext } from '@renderer/context/app';
import { domainPathRegExp } from '@renderer/utils/validationRule';
import { UploaderProfile } from '@main/uploaderProfileManager';
import { ListFile, FileListResponse, DeleteFileResponse, CreateDirectoryResponse } from 'aragorn-types';
import { ColumnsType } from 'antd/lib/table/interface';

export const FileManage = () => {
  const {
    state: {
      uploaderProfiles,
      configuration: { defaultUploaderProfileId }
    }
  } = useAppContext();

  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    function handleResize() {
      setWindowHeight(window.innerHeight);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const { id } = useParams<{ id: string }>();

  const [hasFileManageFeature, setHasFileManageFeature] = useState(false);

  const [uploaderProfile, setUploaderProfile] = useState({} as UploaderProfile);

  useEffect(() => {
    const currentId = id || defaultUploaderProfileId;
    setCurrentProfile(currentId as string);
  }, []);

  useEffect(() => {
    if (uploaderProfile?.id) {
      getList();
    }
  }, [uploaderProfile]);

  const [list, setList] = useState([] as ListFile[]);
  const [listLoading, setListLoading] = useState(false);

  const getList = (directoryPath?: string) => {
    setListLoading(true);
    ipcRenderer.send('file-list-get', uploaderProfile.id, directoryPath);
  };

  const [dirPath, setDirPath] = useState([] as string[]);

  useEffect(() => {
    function handleListGetReply(_, res?: FileListResponse) {
      setListLoading(false);
      if (res === undefined) {
        setHasFileManageFeature(false);
        setList([]);
        message.info(`${uploaderProfile.uploaderName}暂不支持文件管理功能`);
        return;
      }
      setHasFileManageFeature(true);
      if (res.success) {
        setList(res.data);
      } else {
        message.error(`文件列表获取失败 ${res.desc || ''}`);
      }
    }

    function handleFileDeleteReply(_, res?: DeleteFileResponse) {
      if (res === undefined) {
        return;
      }
      if (res.success) {
        message.success({ content: '文件删除成功', key: 'file-manage-delete' });
        getList(dirPath.join('/'));
      } else {
        message.error({ content: `文件删除失败 ${res.desc || ''}`, key: 'file-manage-delete' });
      }
    }

    function handleFileUploadReply() {
      getList(dirPath.join('/'));
    }

    function handleDirectoryCreateReply(_, res?: CreateDirectoryResponse) {
      if (res === undefined) {
        return;
      }
      if (res.success) {
        message.success('目录创建成功');
        setModalVisible(false);
        getList(dirPath.join('/'));
      } else {
        message.error(`目录创建失败 ${res.desc || ''}`);
      }
    }

    ipcRenderer.on('file-list-get-reply', handleListGetReply);
    ipcRenderer.on('file-delete-reply', handleFileDeleteReply);
    ipcRenderer.on('file-upload-reply', handleFileUploadReply);
    ipcRenderer.on('directory-create-reply', handleDirectoryCreateReply);

    return () => {
      ipcRenderer.removeListener('file-list-get-reply', handleListGetReply);
      ipcRenderer.removeListener('file-delete-reply', handleFileDeleteReply);
      ipcRenderer.removeListener('file-upload-reply', handleFileUploadReply);
      ipcRenderer.removeListener('directory-create-reply', handleDirectoryCreateReply);
    };
  }, [uploaderProfile, dirPath]);

  const handleNameClick = (record: ListFile) => {
    if (record.type === 'directory') {
      const newPath = [...dirPath, formatFileName(record.name)];
      setDirPath(newPath);
      getList(newPath.join('/'));
    } else {
      clipboard.writeText(record.url as string);
      message.success('链接已复制到粘贴板');
    }
  };

  const handlePathClick = (index: number) => {
    if (index === -1) {
      setDirPath([]);
      getList();
    } else {
      const newPath = dirPath.slice(0, index + 1);
      setDirPath(newPath);
      getList(newPath.join('/'));
    }
  };

  const setCurrentProfile = (uploaderProfileId: string) => {
    setDirPath([]);
    const uploaderProfile = uploaderProfiles.find(item => item.id === uploaderProfileId);
    setUploaderProfile(uploaderProfile as UploaderProfile);
  };

  const formatFileName = (name: string) => {
    if (dirPath.length > 0) {
      const pathPrefix = dirPath.join('/') + '/';
      return name.split(pathPrefix).pop() || '';
    } else {
      return name;
    }
  };

  const [selectRowKeys, setRowKeys] = useState([] as string[]);
  const [selectRows, setSelectRows] = useState([] as ListFile[]);

  const handleTableRowChange = (selectedRowKeys, selectedRows: ListFile[]) => {
    setRowKeys(selectedRowKeys);
    setSelectRows(selectedRows);
  };

  const handleRefresh = () => {
    getList(dirPath.join('/'));
  };

  const handleBatchDelete = () => {
    Modal.confirm({
      title: '确认删除',
      onOk: () => {
        const names = selectRows.map(item => [...dirPath, formatFileName(item.name)].join('/'));
        message.info({ content: '正在删除，请稍后...', key: 'file-manage-delete' });
        ipcRenderer.send('file-delete', uploaderProfile.id, names);
      }
    });
  };

  const handleDelete = (record: ListFile) => {
    let name = record.name;
    Modal.confirm({
      title: '确认删除',
      content: name,
      onOk: () => {
        let name = record.name;
        if (record.type === 'directory') {
          name = `${[...dirPath, record.name].join('/')}/`;
        } else {
          name = [...dirPath, formatFileName(record.name)].join('/');
        }
        message.info({ content: '正在删除，请稍后...', key: 'file-manage-delete' });
        ipcRenderer.send('file-delete', uploaderProfile.id, [name]);
      }
    });
  };

  const uploadRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.FormEvent<HTMLInputElement>) => {
    const fileList = event.currentTarget.files || [];
    const filesPath = Array.from(fileList).map(file => file.path);
    const pathPrefix = dirPath.join('/');
    ipcRenderer.send('file-upload', uploaderProfile.id, filesPath, pathPrefix);
    event.currentTarget.value = '';
  };

  const [modalVisible, setModalVisible] = useState(false);

  const [form] = Form.useForm();

  const handleCreateDirectory = () => {
    form.validateFields().then(values => {
      ipcRenderer.send('directory-create', uploaderProfile.id, values?.directoryPath || '');
    });
  };

  const handleDownload = (record: ListFile) => {
    ipcRenderer.send('file-download', record.name, record.url);
  };

  const columns: ColumnsType<ListFile> = [
    {
      title: '文件名',
      dataIndex: 'name',
      ellipsis: true,
      render: (val: string, record: ListFile) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {record.type === 'directory' ? (
            <FolderFilled style={{ fontSize: 16 }} />
          ) : (
            <FileOutlined style={{ fontSize: 16 }} />
          )}
          <a
            title={val}
            onClick={() => handleNameClick(record)}
            className="table-filename"
            style={{ marginLeft: 10, overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {formatFileName(val)}
          </a>
        </div>
      )
    },
    {
      title: '文件大小',
      dataIndex: 'size',
      ellipsis: true,
      width: 120,
      render: val => (val ? filesize(val) : '-')
    },
    {
      title: '更新时间',
      dataIndex: 'lastModified',
      ellipsis: true,
      width: 200,
      render: val => (val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '-')
    },
    {
      title: '操作',
      width: 120,
      render: (_, record) => (
        <Space>
          {record.type !== 'directory' && (
            <>
              <DownloadOutlined onClick={() => handleDownload(record)} />
              <CopyOutlined onClick={() => handleNameClick(record)} />
            </>
          )}
          <DeleteOutlined onClick={() => handleDelete(record)} />
        </Space>
      )
    }
  ];

  return (
    <div className="storage-page">
      <header>
        <span>文件管理</span>
        <Divider />
      </header>
      <Space style={{ marginBottom: 10 }}>
        <Select style={{ minWidth: 120 }} value={uploaderProfile?.id} onChange={setCurrentProfile}>
          {uploaderProfiles.map(item => (
            <Select.Option key={item.name} value={item.id}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
        <Button
          icon={<UploadOutlined />}
          disabled={!hasFileManageFeature}
          type="primary"
          onClick={() => {
            uploadRef.current?.click();
          }}
        />
        <Button icon={<ReloadOutlined />} disabled={!hasFileManageFeature} onClick={handleRefresh} />
        <Button
          icon={<FolderAddOutlined />}
          disabled={!hasFileManageFeature}
          onClick={() => {
            setModalVisible(true);
          }}
        />
        <Button icon={<DeleteOutlined />} disabled={selectRows.length === 0} onClick={handleBatchDelete} />
      </Space>
      <Breadcrumb style={{ marginBottom: 10 }}>
        <Breadcrumb.Item>
          <a onClick={() => handlePathClick(-1)}>全部文件</a>
        </Breadcrumb.Item>
        {dirPath.map((item, index) => (
          <Breadcrumb.Item key={item}>
            <a onClick={() => handlePathClick(index)}>{item}</a>
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
      <div className="table-wrapper">
        <Table
          size="small"
          rowKey="name"
          scroll={{ y: windowHeight - 270 }}
          dataSource={list}
          columns={columns}
          pagination={{
            size: 'small',
            defaultPageSize: 100,
            pageSizeOptions: ['50', '100', '200'],
            hideOnSinglePage: true
          }}
          loading={listLoading}
          rowSelection={{
            onChange: handleTableRowChange,
            selectedRowKeys: selectRowKeys,
            getCheckboxProps: record => ({ disabled: record?.type === 'directory' })
          }}
        />
      </div>
      <input ref={uploadRef} type="file" multiple hidden onChange={handleFileUpload} />
      <Modal
        title="创建目录"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleCreateDirectory}
        destroyOnClose={true}
      >
        <Form form={form} preserve={false}>
          <Form.Item
            label="目录名称"
            name="directoryPath"
            rules={[{ required: true }, { pattern: domainPathRegExp, message: '目录名不能以 / 开头或结尾' }]}
          >
            <Input autoFocus />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
