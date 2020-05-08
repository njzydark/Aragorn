import { app } from 'electron';
import ElectronStore from 'electron-store';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';
const store = new ElectronStore({
  cwd: isDev ? path.resolve(__dirname, '../../') : app.getPath('userData')
});

export default store;
