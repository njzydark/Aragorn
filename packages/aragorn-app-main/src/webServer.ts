import { Server, createServer } from 'http';
import express from 'express';
import multer from 'multer';
import { Setting } from './setting';
import { UploaderManager, FileFormData } from './uploaderManager';
import { Ipc } from './ipc';
import { AddressInfo } from 'net';

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
      if (this.server?.listening) {
        const addressInfo = this.server.address() as AddressInfo & { port?: number };
        const port = addressInfo?.port;
        if (port === webServerPort) {
          return;
        } else {
          this.server.close();
        }
      }

      const app = express();

      app.use(express.json());

      app.get('/', (req, res) => {
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
          Ipc.sendMessage('web-server-start-reply', err);
        }
        this.server?.close();
      });

      this.server.listen(webServerPort, '127.0.0.1', () => {
        Ipc.sendMessage('web-server-start-reply');
      });
    } else {
      if (this.server?.listening) {
        this.server.close(err => {
          Ipc.sendMessage('web-server-close-reply', err);
        });
      }
    }
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
