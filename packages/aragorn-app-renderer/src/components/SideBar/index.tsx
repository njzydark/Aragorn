import React, { useState, useRef, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import './index.less';

import DashBorad from '../../assets/dashboard.png';
import Uploader from '../../assets/uploader.png';
import Profile from '../../assets/profile.png';
import Storage from '../../assets/storage.png';
import Upload from '../../assets/upload.png';
import Setting from '../../assets/setting.png';

const menuData = [
  {
    name: 'dashboard',
    path: '/',
    img: DashBorad
  },
  {
    name: 'uploader',
    path: '/uploader',
    img: Uploader
  },
  {
    name: 'profile',
    path: '/profile',
    img: Profile
  },
  {
    name: 'fileManage',
    path: '/fileManage',
    img: Storage
  },
  {
    name: 'upload',
    path: '',
    img: Upload
  },
  {
    name: 'setting',
    path: '/setting',
    img: Setting
  }
];

export const SideBar = () => {
  const [current, setCurrent] = useState('dashboard');

  let location = useLocation();

  useEffect(() => {
    const menuName = location.pathname.split('/')[1] || 'dashboard';
    setCurrent(menuName);
  }, [location]);

  const history = useHistory();

  const uploadRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.FormEvent<HTMLInputElement>) => {
    const fileList = event.currentTarget.files || [];
    const filesPath = Array.from(fileList).map(file => file.path);
    ipcRenderer.send('file-upload-by-side-menu', filesPath);
    event.currentTarget.value = '';
  };

  const handleSideChange = item => {
    if (item.path) {
      setCurrent(item.name);
      history.push(item.path);
    }
    if (item.name === 'upload') {
      uploadRef.current?.click();
    }
  };

  return (
    <div className="side-bar">
      <div className="logo" />
      <div className="menu-list">
        {menuData.slice(0, -1).map(item => (
          <div
            key={item.name}
            className={item.name === current ? 'menu-item menu-active' : 'menu-item'}
            onClick={() => handleSideChange(item)}
          >
            <img src={item.img} />
          </div>
        ))}
      </div>
      <div className="footer">
        {menuData.slice(-1).map(item => (
          <div key={item.name} className="menu-item" onClick={() => handleSideChange(item)}>
            <img src={item.img} />
          </div>
        ))}
      </div>
      <input ref={uploadRef} type="file" multiple hidden onChange={handleFileUpload} />
    </div>
  );
};
