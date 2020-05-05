import React, { Fragment, useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faInfo,
  faHome,
  faToolbox,
  faSitemap,
  IconDefinition,
  faUpload,
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '@/renderer/app';
import './index.less';

type SubMenu = {
  name: string;
  key?: string;
};

type Menu = {
  name: string;
  key: string;
  icon: IconDefinition;
  children?: SubMenu[];
};

type Props = {
  curMenuKey?: string;
};

export function SideBar({ curMenuKey = 'home' }: Props) {
  // 默认菜单项
  const [menus, setMenus] = useState([
    {
      name: '历史记录',
      key: 'history',
      icon: faHistory
    },
    {
      name: 'SDK',
      key: 'sdk',
      icon: faToolbox,
      children: []
    },
    {
      name: 'API',
      key: 'api',
      icon: faSitemap,
      children: []
    },
    {
      name: '上传',
      key: 'upload',
      icon: faUpload
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
  const { userApiList, userSdkList, setCurMenuKey } = useContext(AppContext);
  useEffect(() => {
    const apiSubMenus = userApiList.map(api => ({ name: api.name, key: api.uuid }));
    const sdkSubMenus = userSdkList.map(sdk => ({ name: sdk.name, key: sdk.uuid }));
    setMenus(preMenus => {
      const menus = preMenus.map(menu => {
        if (menu.key === 'sdk') {
          menu.children = sdkSubMenus;
        }
        if (menu.key === 'api') {
          menu.children = apiSubMenus;
        }
        return menu;
      });
      return menus;
    });
  }, [userApiList, userSdkList]);

  const history = useHistory();
  const uploadRef = useRef<HTMLInputElement>(null);
  const jump = (key: string, parentKey?: string) => {
    if (key === 'upload') {
      uploadRef.current?.click();
    } else {
      setCurMenuKey(key);
      history.push(parentKey ? `/${parentKey}/${key}` : `/${key}`);
    }
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
    </div>
  );
}
