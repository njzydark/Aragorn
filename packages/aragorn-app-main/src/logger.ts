import { app, shell } from 'electron';
import log from 'electron-log';

const isDev = process.env.NODE_ENV === 'development';

export class Logger {
  private static instance: Logger;

  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  init() {
    Object.assign(console, log.functions);
    console.log('log init');
    console.log(`log path: ${log.transports.file.getFile().path}`);
  }

  open() {
    console.log('open log');
    shell.openPath(log.transports.file.getFile().path);
  }
}
