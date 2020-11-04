import { Server, createServer } from 'http';
import express from 'express';
import multer from 'multer';
import { Setting } from './setting';
import { UploaderManager, FileFormData } from './uploaderManager';
import { Ipc } from './ipc';

export class WebServer {
  private static instance: WebServer;

  static getInstance() {
    if (!WebServer.instance) {
      WebServer.instance = new WebServer();
    }
    return WebServer.instance;
  }

  setting: Setting;
  uploaderManager: UploaderManager;

  private server?: Server;

  protected constructor() {
    this.setting = Setting.getInstance();
    this.uploaderManager = UploaderManager.getInstance();
  }

  async init() {
    const { openWebServer, webServerPort } = this.setting.configuration;
    if (openWebServer) {
      console.log('init open webserver');
      this.openWebServer(webServerPort, true);
    }
  }

  async toggleWebServer(webserverPort: number) {
    console.log('toggle webserver');
    const { openWebServer } = this.setting.configuration;
    if (openWebServer) {
      console.log('close webserver');
      if (this.server?.listening) {
        this.server.close();
      }
      this.setting.configuration.openWebServer = false;
      this.setting.configuration.webServerPort = webserverPort;
      this.setting.save();
      Ipc.sendMessage('setting-configuration-get-reply', this.setting.configuration);
      Ipc.sendMessage('toggle-webserver-reply', { toggle: false, success: true });
    } else {
      console.log('open webserver');
      this.openWebServer(webserverPort);
    }
  }

  protected openWebServer(webserverPort: number, isInit = false) {
    const app = express();
    app.use(express.json());
    app.get('/', (_, res) => {
      res.send('Aragorn WebServer is running');
    });
    app.post('/', multer().array('files'), async (req: any, res) => {
      const data = await this.handleUpload(req?.files || req.body?.files);
      res.json({
        url: data[0] || '',
        urls: data
      });
    });

    this.server = createServer(app);
    this.server.on('error', (err: Error & { code: string }) => {
      if (err.code === 'EADDRINUSE') {
        console.error('webserver open failed, webserver port is used');
        if (!isInit) {
          Ipc.sendMessage('toggle-webserver-reply', { toggle: true, success: false, message: err.message });
        }
      }
      this.server?.close();
    });
    this.server.listen(webserverPort, '127.0.0.1', () => {
      console.log('webserver open success');
      if (!isInit) {
        this.setting.configuration.openWebServer = true;
        this.setting.configuration.webServerPort = webserverPort;
        this.setting.save();
        Ipc.sendMessage('toggle-webserver-reply', { toggle: true, success: true });
        Ipc.sendMessage('setting-configuration-get-reply', this.setting.configuration);
      }
    });
  }

  protected async handleUpload(data: (string | FileFormData)[]) {
    if (data?.length > 0) {
      const res = await this.uploaderManager.upload({ files: data });
      if (Array.isArray(res)) {
        return res.map(item => item.url);
      }
    }
    return [];
  }
}
