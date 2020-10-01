import React, { createContext, useState, useEffect } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { ipcRenderer, shell } from 'electron';
import { ConfigProvider, message, notification, Progress } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';

import { routes } from './routes';
import { SideBar } from '@renderer/components/SideBar';

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
    checkPlatform();
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
    ipcRenderer.on('web-server-start-reply', (_, err?: Error) => {
      if (err) {
        message.error(`WebServer 启动失败: ${err.message}`);
      } else {
        message.success(`WebServer 启动成功`);
      }
    });
    ipcRenderer.on('web-server-close-reply', (_, err?: Error) => {
      if (err) {
        message.error(`WebServer 关闭失败: ${err.message}`);
      } else {
        message.success(`WebServer 已关闭`);
      }
    });
  };

  const [customScrollStyle, setCustomScrollStyle] = useState(false);

  const checkPlatform = () => {
    const platform = window.navigator.platform.toLowerCase();
    if (!platform.includes('mac')) {
      setCustomScrollStyle(true);
    }
  };

  return (
    <ConfigProvider locale={zhCN}>
      <AppContext.Provider value={data}>
        <HashRouter>
          <SideBar routes={routes} />
          <div
            className={customScrollStyle ? 'app-main-content-wrapper custom-scroll-bar' : 'app-main-content-wrapper'}
          >
            <Switch>
              {routes.map(
                route => route.path && <Route key={route.path} path={route.path} component={route.component} exact />
              )}
            </Switch>
          </div>
        </HashRouter>
      </AppContext.Provider>
    </ConfigProvider>
  );
};

export default App;
