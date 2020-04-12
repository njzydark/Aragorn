import { SettingConfiguration, IApi, ISdk, UserSdkList, IImage } from 'types';
import React, { createContext, useState, useEffect } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { ConfigProvider, message } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import './app.less';

import { SideBar } from '@/renderer/components/SideBar';
import Home from '@/renderer/pages/Home';
import Sdk from './pages/Sdk';
import Api from '@/renderer/pages/Api';
import Setting from '@/renderer/pages/Setting';
import About from '@/renderer/pages/About';

const defaultAppContextValue = {
  images: [] as Partial<IImage>[],
  configuration: {} as SettingConfiguration,
  defaultApi: {} as IApi,
  sdks: [] as ISdk[],
  userApiList: [] as IApi[],
  userSdkList: [] as UserSdkList,
  curMenuKey: '',
  setCurMenuKey: (() => {}) as React.Dispatch<React.SetStateAction<string>>
};

export const AppContext = createContext(defaultAppContextValue);

const App = () => {
  // 侧边菜单默认选中项的key
  const [curMenuKey, setCurMenuKey] = useState('home');
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
    ipcRenderer.send('images-get');
    ipcRenderer.send('setting-basic-get');
    ipcRenderer.send('setting-default-api-get');
    ipcRenderer.send('setting-api-list-get');
    ipcRenderer.send('default-sdk-list-get');
    ipcRenderer.send('sdk-list-get');
  };

  const ipcOnInit = () => {
    ipcRenderer.on('images-get-replay', (_, images: IImage[]) => {
      images.map(image => {
        image.sizes = ['(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw'];
      });
      setData(preData => {
        return {
          ...preData,
          images
        };
      });
    });
    ipcRenderer.on('setting-basic-get-replay', (_, { data }) => {
      setData(preData => {
        return {
          ...preData,
          configuration: data
        };
      });
    });
    ipcRenderer.on('setting-basic-update-replay', (_, { data }) => {
      message.success('系统基础设置更新成功');
      setData(preData => {
        return {
          ...preData,
          configuration: data
        };
      });
    });
    ipcRenderer.on('setting-default-api-get-replay', (_, { data }) => {
      setData(preData => {
        return {
          ...preData,
          defaultApi: data
        };
      });
    });
    ipcRenderer.on('setting-api-list-get-replay', (_, { data }) => {
      setData(preData => {
        return {
          ...preData,
          userApiList: data
        };
      });
    });
    ipcRenderer.on('default-sdk-list-get-replay', (_, { data }) => {
      setData(preData => {
        return {
          ...preData,
          sdks: data
        };
      });
    });
    ipcRenderer.on('sdk-list-get-replay', (_, { data }) => {
      setData(preData => {
        return {
          ...preData,
          userSdkList: data
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
              <Route path="/" component={Home} exact />
              <Route path="/home" component={Home} exact />
              <Route path="/sdk/:uuid?" component={Sdk} exact />
              <Route path="/api/:uuid?" component={Api} exact />
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
