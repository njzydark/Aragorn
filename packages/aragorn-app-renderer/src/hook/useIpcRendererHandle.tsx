import React, { useEffect } from 'react';
import { ipcRenderer, shell } from 'electron';
import { message, notification, Progress } from 'antd';
import { useAppContext } from '@renderer/context/app';
import { UpdaterChannelData } from '@main/updater';

export const useAppStateHandle = () => {
  const { dispatch } = useAppContext();

  useEffect(() => {
    ipcRenderer.send('uploaded-files-get');
    ipcRenderer.send('setting-configuration-get');
    ipcRenderer.send('uploader-profiles-get');
    ipcRenderer.send('uploaders-get');

    ipcRenderer.on('uploaded-files-get-reply', (_, uploadedFiles) => {
      dispatch({
        type: 'update-uploaded-files',
        data: uploadedFiles
      });
    });
    ipcRenderer.on('setting-configuration-get-reply', (_, configuration) => {
      dispatch({
        type: 'update-configuration',
        data: configuration
      });
    });
    ipcRenderer.on('setting-configuration-update-reply', (_, configuration) => {
      message.success('系统基础设置更新成功');
      dispatch({
        type: 'update-configuration',
        data: configuration
      });
    });
    ipcRenderer.on('uploader-profiles-get-reply', (_, uploaderProfiles) => {
      dispatch({
        type: 'update-uploader-profiles',
        data: uploaderProfiles
      });
    });
    ipcRenderer.on('uploaders-get-reply', (_, uploaders) => {
      dispatch({
        type: 'update-uploaders',
        data: uploaders
      });
    });
  }, []);
};

export const useAppUpdateHandle = () => {
  useEffect(() => {
    ipcRenderer.on('app-updater-message', (_, data: UpdaterChannelData) => {
      notification.info({
        message: data.message,
        description: (
          <a
            onClick={() => {
              if (data.url) {
                shell.openExternal(data.url);
              }
            }}
          >
            {data.description}
          </a>
        ),
        key: 'updaterMessage',
        duration: null
      });
    });
  }, []);
};

export const useFileDownloadHandle = () => {
  useEffect(() => {
    ipcRenderer.on('file-download-reply', (_, errMessage?: string) => {
      if (errMessage) {
        message.error(errMessage);
      } else {
        message.success('下载成功');
      }
    });
    ipcRenderer.on('file-download-progress', (_, res: { name: string; progress: number; key: string }) => {
      const percent = Math.floor(res.progress * 100);
      const isFinish = percent === 100;
      notification.open({
        type: isFinish ? 'success' : 'info',
        message: isFinish ? '下载完成' : `正在下载${res.name}`,
        description: <Progress percent={percent} />,
        key: res.key,
        duration: isFinish ? 1.5 : null
      });
    });
  }, []);
};
