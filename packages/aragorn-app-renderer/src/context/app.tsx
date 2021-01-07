import React, { useContext, useReducer } from 'react';
import { UploadedFileInfo } from '@main/uploaderManager';
import { SettingConfiguration } from '@main/setting';
import { UploaderProfile } from '@main/uploaderProfileManager';
import { Uploader as IUploader, UploaderConfig } from 'aragorn-types';

interface State {
  configuration: SettingConfiguration;
  uploaders: IUploader[];
  uploadedFiles: UploadedFileInfo[];
  uploaderProfiles: UploaderProfile[];
}

type ActionType = 'update-configuration' | 'update-uploaders' | 'update-uploaded-files' | 'update-uploader-profiles';

const reducer: React.Reducer<State, { type: ActionType; data: any }> = (state, action) => {
  switch (action.type) {
    case 'update-configuration':
      return {
        ...state,
        configuration: action.data
      };
    case 'update-uploaders':
      return {
        ...state,
        uploaders: action.data
      };
    case 'update-uploaded-files':
      return {
        ...state,
        uploadedFiles: action.data
      };
    case 'update-uploader-profiles':
      console.log(action);
      return {
        ...state,
        uploaderProfiles: action.data
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const initialState: State = {
  uploadedFiles: [],
  configuration: {} as SettingConfiguration,
  uploaderProfiles: [],
  uploaders: []
};

const AppContext = React.createContext<{ state: State; dispatch: React.Dispatch<{ type: ActionType; data: any }> }>({
  state: initialState,
  dispatch: () => {}
});

export const AppContextProvider = props => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return <AppContext.Provider value={{ state, dispatch }} {...props} />;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
