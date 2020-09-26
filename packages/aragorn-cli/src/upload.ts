import axios from 'axios';
import { AragornCore } from 'aragorn-core';
import fs from 'fs';
import path from 'path';
import { UploadResponseData } from 'aragorn-types';

interface Options {
  mode: 'auto' | 'app' | 'cli';
  port: string;
  uploaderProfileName?: string;
  uploaderProfileId?: string;
}

export const upload = async (filesPath: string[], options: Options) => {
  const { userSetting } = getAppConfig();
  const { webServerPort = options.port } = userSetting;

  let flag = false;
  if (options.mode === 'auto') {
    flag = await webServerCheck(Number(webServerPort));
  }
  if (options.mode === 'app' || flag) {
    uploadByApp(filesPath, Number(webServerPort));
  } else {
    uploadByCli(filesPath, options);
  }
};

async function webServerCheck(port: number) {
  try {
    const res = await axios.get(`http://127.0.0.1:${port}`);
    return res.data?.includes('Aragorn WebServer is running');
  } catch (err) {
    return false;
  }
}

async function uploadByApp(filesPath: string[], port: number) {
  try {
    const res = await axios.post(`http://127.0.0.1:${port}`, {
      files: filesPath
    });
    if (Array.isArray(res?.data?.urls)) {
      console.log(res.data.urls.join('\n'));
    } else {
      console.log('upload fail');
    }
  } catch (err) {
    console.log('upload by app fail: ', err.message);
  }
}

async function uploadByCli(filesPath: string[], options: Options) {
  try {
    const core = new AragornCore();

    const { userSetting, uploaderProfiles } = getAppConfig();

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

      const res = await uploader.upload({ file, fileName });
      if (res.success) {
        successRes.push(res.data);
      } else {
        failRes.push({ errorMessage: res.desc });
      }
    };

    const promises = filesPath.map((file, index) => {
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

function getAppConfig() {
  const userDataPath = `${process.env.HOME}/Library/Application Support/aragorn`;

  const userSetting = JSON.parse(fs.readFileSync(path.join(userDataPath, 'setting.json'), 'utf8'))?.setting || {};
  const uploaderProfiles =
    JSON.parse(fs.readFileSync(path.join(userDataPath, 'uploaderProfiles.json'), 'utf8'))?.uploaderProfiles || [];
  return {
    userSetting,
    uploaderProfiles
  };
}

export default upload;
