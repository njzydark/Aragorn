import { ISdk } from 'types';
import { Qiniu } from './qiniu';
import { Upyun } from './upyun';
import { UCloud } from './ucloud';

const qiniu = new Qiniu();
const upyun = new Upyun();
const ucloud = new UCloud();

export const sdks: ISdk[] = [qiniu, upyun, ucloud];
