import React, { Fragment, useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faInfo, faToolbox, IconDefinition, faUpload, faHistory } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '@renderer/app';
import './index.less';

interface SubMenu {
  name: string;
  key?: string;
}

interface Menu {
  name: string;
  key: string;
  icon: IconDefinition;
  children?: SubMenu[];
}

interface Props {
  curMenuKey?: string;
}

export function SideBar({ curMenuKey = 'home' }: Props) {
  // 默认菜单项
  const [menus, setMenus] = useState([
    {
      name: '历史记录',
      key: 'history',
      icon: faHistory
    },
    {
      name: '上传器配置',
      key: 'uploaderProfile',
      icon: faToolbox,
      children: []
    },
    {
      name: '设置',
      key: 'setting',
      icon: faCog
    },
    {
      name: '关于',
      key: 'about',
      icon: faInfo
    }
  ] as Menu[]);

  // 获取用户配置的api和sdk列表
  const { uploaderProfiles, setCurMenuKey } = useContext(AppContext);
  useEffect(() => {
    const uploaderProfileSubMens = uploaderProfiles.map(item => ({ name: item.name, key: item.id }));
    setMenus(preMenus => {
      const menus = preMenus.map(menu => {
        if (menu.key === 'uploaderProfile') {
          menu.children = uploaderProfileSubMens;
        }
        return menu;
      });
      return menus;
    });
  }, [uploaderProfiles]);

  const history = useHistory();
  const jump = (key: string, parentKey?: string) => {
    setCurMenuKey(key);
    history.push(parentKey ? `/${parentKey}/${key}` : `/${key}`);
  };

  const uploadRef = useRef<HTMLInputElement>(null);
  const handleFlatBtnClick = () => {
    console.log(uploadRef);
    uploadRef.current?.click();
  };

  const handleFileUpload = (event: React.FormEvent<HTMLInputElement>) => {
    const fileList = event.currentTarget.files || [];
    const filesPath = Array.from(fileList).map(file => file.path);
    ipcRenderer.send('file-upload-by-side-menu', filesPath);
    event.currentTarget.value = '';
  };

  return (
    <div className="side-bar-wrapper">
      <div className="title">Aragorn</div>
      <div className="menu-list">
        {menus.map(menu => (
          <Fragment key={menu.key}>
            <div
              className={classnames(
                'menu-item',
                { 'has-sub-menu': menu?.children?.length !== 0 },
                { active: menu.key === curMenuKey }
              )}
              onClick={() => jump(menu.key)}
            >
              <FontAwesomeIcon icon={menu.icon} />
              {menu.name}
            </div>
            {menu?.children?.map(item => (
              <div
                key={menu.key + item.key}
                className={classnames('menu-item', 'sub-menu', { active: item.key === curMenuKey })}
                onClick={() => jump(item.key as string, menu.key)}
              >
                {item.name}
              </div>
            ))}
          </Fragment>
        ))}
        <input ref={uploadRef} type="file" multiple hidden onChange={handleFileUpload} />
      </div>
      <div className="flat-btn" onClick={handleFlatBtnClick}>
        <FontAwesomeIcon icon={faUpload} />
      </div>
    </div>
  );
}
