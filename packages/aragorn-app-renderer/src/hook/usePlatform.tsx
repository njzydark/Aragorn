import { useState, useEffect } from 'react';

type Platform = 'darwin' | 'linux' | 'win32';

export const usePlatform = () => {
  const [platform, setPlatform] = useState<Platform>('win32');

  useEffect(() => {
    const platform = window.navigator.platform.toLowerCase();
    if (platform.includes('mac')) {
      setPlatform('darwin');
    } else if (platform.includes('win')) {
      setPlatform('win32');
    } else {
      setPlatform('linux');
    }
  }, []);

  return platform;
};
