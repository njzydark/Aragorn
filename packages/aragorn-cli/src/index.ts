import { program } from 'commander';
import figlet from 'figlet';
import Standard from 'figlet/importable-fonts/Standard';
import { clear, log } from 'console';
import pkg from '../package.json';
import { upload } from './upload';

clear();

figlet.parseFont('Standard', Standard);

log(figlet.textSync('Aragorn Cli'));
log();
log(pkg.description);
log();

program.version(pkg.version, '-v,--version');

program
  .command('upload <imagesPath...>')
  .option('-m,--mode <mode>', 'upload mode, auto or cli or app', 'auto')
  .option('-p,--port <port>', 'app webserver port', '7777')
  .option('--uploaderProfileName [uploaderProfileName]', 'uploader profile name')
  .option('--uploaderProfileId [uploaderProfileId]', 'uploader profile id')
  .description('upload files')
  .action(upload);

program.parse(process.argv);
