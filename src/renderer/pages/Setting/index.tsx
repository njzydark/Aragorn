import React, { useContext, useEffect, useState } from 'react';
import { Switch, Route, useHistory, useRouteMatch } from 'react-router-dom';
import { AppContext } from '@/renderer/app';
import { ipcRenderer } from 'electron';
import { Menu, message } from 'antd';

import Basic from './Basic';
import Api from './Api';
import Sdk from './Sdk';
import About from './about';

const { SubMenu } = Menu;

export default function Setting() {
  document.title = 'Aragorn-Setting';

  const { userApiList, userSdkList } = useContext(AppContext);
  const { path, url } = useRouteMatch();
  const history = useHistory();
  const [selectedKeys, setSelectedKeys] = useState(['basic']);
  const [openKeys, setOpenKeys] = useState(['']);

  useEffect(() => {
    function handleApiAdd(_, { data }) {
      setOpenKeys(['apiList']);
      setSelectedKeys([`apiList_${data.uuid}`]);
      history.push(`${url}/apiList/${data.uuid}`);
      message.success('API添加成功');
    }
    function handleApiDelete() {
      setOpenKeys(['']);
      setSelectedKeys(['api']);
      history.push(`${url}/api`);
      message.success('API删除成功');
    }
    function handleSdkAdd(_, { data }) {
      setOpenKeys(['sdkList']);
      setSelectedKeys([`sdkList_${data.uuid}`]);
      history.push(`${url}/sdkList/${data.uuid}`);
      message.success('SDK添加成功');
    }
    function handleSdkDelete() {
      setOpenKeys(['']);
      setSelectedKeys(['sdk']);
      history.push(`${url}/sdk`);
      message.success('SDK删除成功');
    }

    ipcRenderer.on('setting-api-add-replay', handleApiAdd);
    ipcRenderer.on('setting-api-delete-replay', handleApiDelete);
    ipcRenderer.on('sdk-add-replay', handleSdkAdd);
    ipcRenderer.on('sdk-delete-replay', handleSdkDelete);

    return () => {
      ipcRenderer.removeListener('setting-api-add-replay', handleApiAdd);
      ipcRenderer.removeListener('setting-api-delete-replay', handleApiDelete);
      ipcRenderer.removeListener('sdk-add-replay', handleSdkAdd);
      ipcRenderer.removeListener('sdk-delete-replay', handleSdkDelete);
    };
  }, []);

  const handleSelect = ({ key }) => {
    setSelectedKeys([key]);
    const defaultKeys = ['basic', 'api', 'sdk', 'about'];
    if (defaultKeys.includes(key)) {
      history.push(`${url}/${key}`);
    } else {
      const keyArr = key.split('_');
      if (keyArr[0] === 'apiList') {
        history.push(`${url}/apiList/${keyArr[1]}`);
      }
      if (keyArr[0] === 'sdkList') {
        console.log(keyArr);
        history.push(`${url}/sdkList/${keyArr[1]}`);
      }
    }
  };

  const handleSubMenuOpen = openKeys => {
    setOpenKeys(openKeys);
  };

  return (
    <div className="setting-wrapper">
      <Menu
        className="side-menu"
        theme="light"
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onSelect={handleSelect}
        onOpenChange={handleSubMenuOpen}
      >
        <Menu.Item key="basic">基础</Menu.Item>
        <Menu.Item key="api">API</Menu.Item>
        {userApiList.length > 0 && (
          <SubMenu key="apiList" title={<span>API列表</span>}>
            {userApiList.map(api => (
              <Menu.Item key={`apiList_${api.uuid}`}>{api.name}</Menu.Item>
            ))}
          </SubMenu>
        )}
        <Menu.Item key="sdk">SDK</Menu.Item>
        {userSdkList.length > 0 && (
          <SubMenu key="sdkList" title={<span>SDK列表</span>}>
            {userSdkList.map(sdk => (
              <Menu.Item key={`sdkList_${sdk.uuid}`}>{sdk.name}</Menu.Item>
            ))}
          </SubMenu>
        )}
        <Menu.Item key="about">关于</Menu.Item>
      </Menu>
      <div className="main-content">
        <Switch>
          <Route path={`${path}/basic`} component={Basic} exact />
          <Route path={`${path}/api`} component={Api} exact />
          <Route path={`${path}/apiList/:uuid`} component={Api} exact />
          <Route path={`${path}/sdk`} component={Sdk} exact />
          <Route path={`${path}/sdkList/:uuid`} component={Sdk} exact />
          <Route path={`${path}/about`} component={About} exact />
        </Switch>
      </div>
    </div>
  );
}
