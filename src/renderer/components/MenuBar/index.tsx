import React from 'react';
import { useHistory } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faUpload, faHome } from '@fortawesome/free-solid-svg-icons';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import './index.less';

export function MenuBar() {
  const history = useHistory();

  const handleImageUpload = (event: React.FormEvent<HTMLInputElement>) => {
    const fileList = event.currentTarget.files || [];
    const filesPath = Array.from(fileList).map(file => file.path);
    ipcRenderer.send('image-upload', filesPath);
  };

  const handleOpenHomeWindow = () => {
    history.push('/');
  };

  const handleOpenSettingWindow = () => {
    history.push('/setting/basic');
  };

  const handleOpenInfoWindow = () => {
    history.push('/info');
  };

  return (
    <div className="menu-bar-wrapper">
      <div className="left-menu">
        <div className="menu menu-btn" id="menu-date-btn">
          <DatePicker
            bordered={false}
            suffixIcon={null}
            allowClear={false}
            style={{ padding: 0, color: '#fff' }}
            value={dayjs() as any}
            getPopupContainer={triggerNode => triggerNode.parentNode as HTMLElement}
          />
        </div>
      </div>
      <div className="right-menu">
        <div className="menu menu-icon" onClick={handleOpenHomeWindow}>
          <FontAwesomeIcon icon={faHome} />
        </div>
        <div className="menu menu-icon">
          <input id="image-upload" type="file" accept="image/*" multiple hidden onChange={handleImageUpload} />
          <label htmlFor="image-upload">
            <FontAwesomeIcon icon={faUpload} />
          </label>
        </div>
        <div className="menu menu-icon" onClick={handleOpenSettingWindow}>
          <FontAwesomeIcon icon={faCog} />
        </div>
      </div>
    </div>
  );
}
