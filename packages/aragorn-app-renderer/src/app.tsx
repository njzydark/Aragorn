import React, { createContext, useState, useEffect } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { ipcRenderer, shell } from 'electron';
import { ConfigProvider, message, notification, Progress } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';

import { SideBar } from '@renderer/components/SideBar';
import { Dashboard } from '@renderer/pages/Dashboard';
import { Uploader } from '@renderer/pages/Uploader';
import { Profile } from '@renderer/pages/Profile';
import { FileManage } from '@renderer/pages/FileManage';
import About from '@renderer/pages/About';
import Setting from '@renderer/pages/Setting';

import { UploadedFileInfo } from '@main/uploaderManager';
import { SettingConfiguration } from '@main/setting';
import { UploaderProfile } from '@main/uploaderProfileManager';
import { UpdaterChannelData } from '@main/updater';
import { Uploader as IUploader } from 'aragorn-types';

import './app.less';

const defaultAppContextValue = {
  uploadedFiles: [] as UploadedFileInfo[],
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  configuration: {} as SettingConfiguration,
  uploaderProfiles: [] as UploaderProfile[],
  uploaders: [] as IUploader[]
};

export const AppContext = createContext(defaultAppContextValue);

const App = () => {
  // 全局context值
  const [data, setData] = useState(defaultAppContextValue);

  useEffect(() => {
    ipcSendInit();
    ipcOnInit();
  }, []);

  const ipcSendInit = () => {
    ipcRenderer.send('uploaded-files-get');
    ipcRenderer.send('setting-configuration-get');
    ipcRenderer.send('uploader-profiles-get');
    ipcRenderer.send('uploaders-get');
  };

  const ipcOnInit = () => {
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
    ipcRenderer.on('file-download-reply', (_, res?: boolean) => {
      if (res) {
        message.success('下载成功');
      } else {
        message.error('下载失败');
      }
    });
    ipcRenderer.on('file-download-progress', (_, res: { name: string; progress: number; key: string }) => {
      const percent = Math.floor(res.progress * 100);
      notification.info({
        message: `正在下载${res.name}`,
        description: <Progress percent={percent} />,
        key: res.key,
        duration: percent === 100 ? 1.5 : null
      });
    });
    ipcRenderer.on('uploaded-files-get-reply', (_, uploadedFiles: UploadedFileInfo[]) => {
      setData(preData => {
        return {
          ...preData,
          uploadedFiles
        };
      });
    });
    ipcRenderer.on('setting-configuration-get-reply', (_, configuration) => {
      setData(preData => {
        return {
          ...preData,
          configuration
        };
      });
    });
    ipcRenderer.on('setting-configuration-update-reply', (_, configuration) => {
      message.success('系统基础设置更新成功');
      setData(preData => {
        return {
          ...preData,
          configuration
        };
      });
    });
    ipcRenderer.on('uploader-profiles-get-reply', (_, uploaderProfiles) => {
      setData(preData => {
        return {
          ...preData,
          uploaderProfiles
        };
      });
    });
    ipcRenderer.on('uploaders-get-reply', (_, uploaders) => {
      setData(preData => {
        return {
          ...preData,
          uploaders
        };
      });
    });
  };

  return (
    <ConfigProvider locale={zhCN}>
      <AppContext.Provider value={data}>
        <HashRouter>
          <SideBar />
          <div className="main-content-wrapper">
            <Switch>
              <Route path="/" component={Dashboard} exact />
              <Route path="/uploader" component={Uploader} exact />
              <Route path="/profile/:id?" component={Profile} exact />
              <Route path="/fileManage/:id?" component={FileManage} exact />
              <Route path="/about" component={About} exact />
              <Route path="/setting" component={Setting} exact />
            </Switch>
          </div>
        </HashRouter>
      </AppContext.Provider>
    </ConfigProvider>
  );
};

export default App;
