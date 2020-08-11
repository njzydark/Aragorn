import React, { createContext, useState, useEffect } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { ConfigProvider, message, notification, Progress } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import './app.less';

import { SideBar } from '@renderer/components/SideBar';
import History from './pages/History';
import UploaderProfileComponent from './pages/UploaderProfile';
import Setting from '@renderer/pages/Setting';
import About from '@renderer/pages/About';
import { UploadedFileInfo } from '@main/upload';
import { SettingConfiguration } from '@main/setting';
import { UploaderProfile } from '@main/uploaderProfileManager';
import { UpdaterChannelData } from '@main/updater';
import { Uploader } from 'aragorn-types';

const defaultAppContextValue = {
  uploadedFiles: [] as UploadedFileInfo[],
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  configuration: {} as SettingConfiguration,
  uploaderProfiles: [] as UploaderProfile[],
  uploaders: [] as Uploader[],
  curMenuKey: '',
  setCurMenuKey: (() => {}) as React.Dispatch<React.SetStateAction<string>>
};

export const AppContext = createContext(defaultAppContextValue);

const App = () => {
  // 侧边菜单默认选中项的key
  const [curMenuKey, setCurMenuKey] = useState('history');
  // 全局context值
  const [data, setData] = useState({
    ...defaultAppContextValue,
    curMenuKey,
    setCurMenuKey
  });

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
        description: data.percent ? <Progress percent={data.percent} /> : data.description,
        key: 'updaterMessage'
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
          <SideBar curMenuKey={curMenuKey} />
          <div className="main-content-wrapper">
            <Switch>
              <Route path="/" component={History} exact />
              <Route path="/history" component={History} exact />
              <Route path="/uploaderProfile/:id?" component={UploaderProfileComponent} exact />
              <Route path="/setting" component={Setting} exact />
              <Route path="/about" component={About} exact />
            </Switch>
          </div>
        </HashRouter>
      </AppContext.Provider>
    </ConfigProvider>
  );
};

export default App;
