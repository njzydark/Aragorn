import React, { useContext, useEffect, useState } from 'react';
import { Switch, Route, useHistory, useRouteMatch } from 'react-router-dom';
import { AppContext } from '@/renderer/app';
import { ipcRenderer } from 'electron';
import { Menu, message } from 'antd';
import './index.less';

import Basic from './Basic';
import Api from './Api';
import About from './about';

const { SubMenu } = Menu;

export default function Setting() {
  document.title = 'Aragorn-Setting';

  const { apiList } = useContext(AppContext);
  const { path, url } = useRouteMatch();
  const history = useHistory();
  const [selectedKeys, setSelectedKeys] = useState(['basic']);
  const [openKeys, setOpenKeys] = useState(['']);

  useEffect(() => {
    ipcOnInit();
  }, []);

  const ipcOnInit = () => {
    ipcRenderer.on('setting-api-add-replay', (_, { data }) => {
      setOpenKeys(['apiList']);
      setSelectedKeys([data.name]);
      history.push(`${url}/api/${data.name}`);
      message.success('API添加成功');
    });

    ipcRenderer.on('setting-api-update-replay', () => {
      message.success('API更新成功');
    });

    ipcRenderer.on('setting-api-delete-replay', () => {
      setOpenKeys(['apiList']);
      setSelectedKeys(['api']);
      history.push(`${url}/api`);
      message.success('API删除成功');
    });
  };

  const handleSelect = ({ key }) => {
    setSelectedKeys([key]);
    const defaultKeys = ['basic', 'api', 'about'];
    if (defaultKeys.includes(key)) {
      history.push(`${url}/${key}`);
    } else {
      history.push(`${url}/api/${key}`);
    }
  };

  const handleSubMenuOpen = openKeys => {
    setOpenKeys(openKeys);
  };

  return (
    <div className="setting-wrapper">
      <Menu
        theme="light"
        mode="inline"
        style={{ width: 200, height: '100%' }}
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onSelect={handleSelect}
        onOpenChange={handleSubMenuOpen}
      >
        <Menu.Item key="basic">基础</Menu.Item>
        <Menu.Item key="api">API</Menu.Item>
        {apiList.length > 0 && (
          <SubMenu key="apiList" title={<span>API列表</span>}>
            {apiList.map(api => (
              <Menu.Item key={api.name}>{api.name}</Menu.Item>
            ))}
          </SubMenu>
        )}
        <Menu.Item key="about">关于</Menu.Item>
      </Menu>
      <div className="setting-content">
        <Switch>
          <Route path={`${path}/basic`} component={Basic} exact />
          <Route path={`${path}/api/:name?`} component={Api} exact />
          <Route path={`${path}/about`} component={About} exact />
        </Switch>
      </div>
    </div>
  );
}
