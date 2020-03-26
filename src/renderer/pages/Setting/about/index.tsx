import React, { useEffect } from 'react';
import './index.less';

export default function About() {
  useEffect(() => {
    document.title = '关于';
  }, []);

  return (
    <div className="info-wrapper">
      <h3>Aragorn</h3>
      <p className="desc">A simple image upload tool by njzydark</p>
    </div>
  );
}
