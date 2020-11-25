import React from 'react';
import { Grid, Package, Box, Info, Settings, Upload, Server, IconProps } from 'react-feather';
import { Dashboard } from '@renderer/pages/Dashboard';
import { Uploader } from '@renderer/pages/Uploader';
import { Profile } from '@renderer/pages/Profile';
import { FileManage } from '@renderer/pages/FileManage';
import { About } from '@renderer/pages/About';
import { Setting } from '@renderer/pages/Setting';

export type Routes = {
  name: string;
  path?: string;
  component?: React.FunctionComponent;
  icon: React.FC<IconProps>;
  isFooter?: boolean;
}[];

export const routes: Routes = [
  {
    name: 'dashboard',
    path: '/',
    component: Dashboard,
    icon: Grid
  },
  {
    name: 'uploader',
    path: '/uploader',
    component: Uploader,
    icon: Package
  },
  {
    name: 'profile',
    path: '/profile/:id?',
    component: Profile,
    icon: Box
  },
  {
    name: 'fileManage',
    path: '/fileManage/:id?',
    component: FileManage,
    icon: Server
  },
  {
    name: 'upload',
    icon: Upload
  },
  {
    name: 'about',
    path: '/about',
    component: About,
    icon: Info,
    isFooter: true
  },
  {
    name: 'setting',
    path: '/setting',
    component: Setting,
    icon: Settings,
    isFooter: true
  }
];
