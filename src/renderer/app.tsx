import React, { createContext, useEffect, useState } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { ConfigProvider, message } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';

import { IImage, IBasic, IApi } from 'types';

import { MenuBar } from '@/renderer/components/MenuBar';
import Home from '@/renderer/pages/Home';
import Setting from '@/renderer/pages/Setting';

const defaultAppContextValue = {
  images: [] as Partial<IImage>[],
  basic: {} as IBasic,
  defaultApi: {} as IApi,
  apiList: [] as IApi[]
};

export const AppContext = createContext(defaultAppContextValue);

const App = () => {
  const [data, setData] = useState(defaultAppContextValue);
  useEffect(() => {
    ipcSendInit();
    ipcOnInit();
  }, []);

  const ipcSendInit = () => {
    ipcRenderer.send('images-get');
    ipcRenderer.send('setting-basic-get');
    ipcRenderer.send('setting-default-api-get');
    ipcRenderer.send('setting-api-list-get');
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
          basic: data
        };
      });
    });
    ipcRenderer.on('setting-basic-update-replay', (_, { data }) => {
      message.success('系统基础设置更新成功');
      setData(preData => {
        return {
          ...preData,
          basic: data
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
          apiList: data
        };
      });
    });
  };

  return (
    <ConfigProvider locale={zhCN}>
      <AppContext.Provider value={data}>
        <HashRouter>
          <Switch>
            <Route path="/" component={Home} exact />
            <Route path="/setting" component={Setting} />
          </Switch>
          <MenuBar />
        </HashRouter>
      </AppContext.Provider>
    </ConfigProvider>
  );
};

export default App;
