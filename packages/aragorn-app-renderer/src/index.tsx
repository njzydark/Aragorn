import ReactDOM from 'react-dom';
import { AppContextProvider } from '@renderer/context/app';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import App from './app';

ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </ConfigProvider>,
  document.getElementById('root')
);
