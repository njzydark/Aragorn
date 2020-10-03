import React, { useState, useRef, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useHistory, useLocation } from 'react-router-dom';
import { Routes } from '@renderer/routes';
import './index.less';

interface Props {
  routes: Routes;
  className?: string;
}

interface MenuProps extends Props {
  current: string;
  handleSideChange: (route: Routes[number]) => void;
}

const Menu = ({ routes, current, handleSideChange }: MenuProps) => {
  return (
    <>
      {routes.map(route => (
        <div
          key={route.name}
          className={route.name === current ? 'menu-item menu-active' : 'menu-item'}
          onClick={() => handleSideChange(route)}
        >
          <route.icon className="menu-icon" />
        </div>
      ))}
    </>
  );
};

export const SideBar = ({ routes, className = '' }: Props) => {
  const [current, setCurrent] = useState(routes[0].name);

  let location = useLocation();

  useEffect(() => {
    const menuName = location.pathname.split('/')[1] || routes[0].name;
    setCurrent(menuName);
  }, [location]);

  const history = useHistory();

  const uploadRef = useRef<HTMLInputElement>(null);

  const handleSideChange = (item: Routes[0]) => {
    if (item.path) {
      setCurrent(item.name);
      history.push(item.path.split(':')[0]);
    }
    if (item.name === 'upload') {
      uploadRef.current?.click();
    }
  };

  const handleFileUpload = (event: React.FormEvent<HTMLInputElement>) => {
    const fileList = event.currentTarget.files || [];
    const filesPath = Array.from(fileList).map(file => file.path);
    ipcRenderer.send('file-upload-by-side-menu', filesPath);
    event.currentTarget.value = '';
  };

  return (
    <div className={`app-sidebar-wrapper ${className}`}>
      <div className="logo" />
      <div className="menu-list">
        <Menu routes={routes.filter(item => !item.isFooter)} current={current} handleSideChange={handleSideChange} />
      </div>
      <div className="footer">
        <Menu routes={routes.filter(item => item.isFooter)} current={current} handleSideChange={handleSideChange} />
      </div>
      <input ref={uploadRef} type="file" multiple hidden onChange={handleFileUpload} />
    </div>
  );
};
