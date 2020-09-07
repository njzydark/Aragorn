import axios from 'axios';
import { AragornCore } from 'aragorn-core';
import fs from 'fs';
import path from 'path';
import { UploadResponseData } from 'aragorn-types';

interface Options {
  mode: 'app' | 'cli';
  port: string;
  uploaderProfileName?: string;
  uploaderProfileId?: string;
}

export const upload = async (imagesPath: string[], options: Options) => {
  if (options.mode === 'app') {
    uploadByApp(imagesPath, Number(options.port));
  } else {
    uploadByCli(imagesPath, options);
  }
};

async function uploadByApp(imagesPath: string[], port: number) {
  try {
    const res = await axios.post(`http://localhost:${port}`, {
      images: imagesPath
    });
    if (Array.isArray(res.data)) {
      console.log(res.data.join('\n'));
    } else {
      console.log('upload fail');
    }
  } catch (err) {
    console.log('upload by app fail: ', err.message);
  }
}

async function uploadByCli(imagesPath: string[], options: Options) {
  try {
    const core = new AragornCore();

    const userDataPath = `${process.env.HOME}/Library/Application Support/aragorn`;

    const userSetting = JSON.parse(fs.readFileSync(path.join(userDataPath, 'setting.json'), 'utf8'))?.setting || {};
    const uploaderProfiles =
      JSON.parse(fs.readFileSync(path.join(userDataPath, 'uploaderProfiles.json'), 'utf8'))?.uploaderProfiles || [];

    const { uploaderProfileId, uploaderProfileName } = options;
    const { defaultUploaderProfileId, proxy, rename, renameFormat } = userSetting;

    let uploaderProfile;

    if (uploaderProfileId) {
      uploaderProfile = uploaderProfiles.find(item => item.id === uploaderProfileId);
    } else if (uploaderProfileName) {
      uploaderProfile = uploaderProfile.find(item => item.name === uploaderProfileName);
    } else if (defaultUploaderProfileId) {
      uploaderProfile = uploaderProfiles.find(item => item.id === defaultUploaderProfileId);
    } else {
      return console.log('no uploader profile found');
    }

    if (!uploaderProfile) {
      return console.log('not found uploader profile');
    }

    const uploader = core.getUploaderByName(uploaderProfile.uploaderName);

    if (!uploader) {
      return console.log('no uploader found');
    }

    uploader.changeOptions(uploaderProfile.uploaderOptions, proxy);
    const successRes = [] as UploadResponseData[];
    const failRes = [] as { errorMessage: string }[];

    const uploadQuence = [] as any[];

    const toUpload = async (file: string, index: number, uploadQuence: any[]) => {
      const fileName = core.getFileNameByFormat(file, rename, renameFormat);

      if (uploader.batchUploadMode === 'Sequence' && index > 0) {
        await uploadQuence[index - 1];
      }

      const res = await uploader.upload(file, fileName);
      if (res.success) {
        successRes.push(res.data);
      } else {
        failRes.push({ errorMessage: res.desc });
      }
    };

    const promises = imagesPath.map((file, index) => {
      const res = toUpload(file, index, uploadQuence);
      uploadQuence.push(res);
      return res;
    });

    await Promise.all(promises);

    if (successRes.length > 0) {
      const urls = successRes.map(item => item.url);
      console.log(urls.join('\n'));
    } else {
      console.log('upload fail');
    }
  } catch (err) {
    console.log('upload by cli fail: ', err.message);
  }
}

export default upload;
