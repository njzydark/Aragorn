import React from 'react';
import { X, Maximize2, Minus } from 'react-feather';
import { remote } from 'electron';
import './index.less';

const mainWindow = remote.getCurrentWindow();

export const WindowButton = () => {
  function minWindow() {
    mainWindow.minimize();
  }
  function maxWindow() {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
  function closeWindow() {
    mainWindow.close();
  }

  return (
    <div className="window-button-wrapper">
      <div className="btn" onClick={minWindow}>
        <Minus className="icon" />
      </div>
      <div className="btn" onClick={maxWindow}>
        <Maximize2 className="icon icon-max" />
      </div>
      <div className="btn btn-close" onClick={closeWindow}>
        <X className="icon" />
      </div>
    </div>
  );
};
