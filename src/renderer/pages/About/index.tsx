import { ipcRenderer } from 'electron';
import React from 'react';
import './index.less';
import { Button } from 'antd';

export default function About() {
  function handleUpdate() {
    ipcRenderer.send('check-update');
  }

  return (
    <div className="info-wrapper">
      <main>
        <h3>Aragorn</h3>
        <p className="desc">A upload tool by njzydark</p>
        <Button type="primary" onClick={handleUpdate}>
          检查更新
        </Button>
      </main>
    </div>
  );
}
