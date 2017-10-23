// @flow
import { MARIO_CONFIG_PATH, MARIO_RUNSTATE_FILENAME, MARIO_CONFIG_FILENAME } from '../constants';

const fse = require('fs-extra');
const path = require('path');

type actionType = {
  +type: string
};

export const FETCH_WORKFLOW_SUCCESS = 'FETCH_WORKFLOW_SUCCESS';
export const FETCH_RUNSTATE_SUCCESS = 'FETCH_RUNSTATE_SUCCESS';

export function fetchWorkflow() {
  fse.ensureDirSync(MARIO_CONFIG_PATH);
  const files = fse.readdirSync(MARIO_CONFIG_PATH);
  const pipes = {};

  files.forEach((file) => {
    const pathname = path.join(MARIO_CONFIG_PATH, file);
    const stat = fse.lstatSync(pathname);
    if (stat.isDirectory() && fse.existsSync(path.join(pathname, MARIO_CONFIG_FILENAME))) {
      const pipeConfig = fse.readJsonSync(path.join(pathname, MARIO_CONFIG_FILENAME));
      pipes[file] = pipeConfig;
    }
  });

  return (dispatch: (action: actionType) => void) => {
    dispatch({
      type: FETCH_WORKFLOW_SUCCESS,
      data: pipes
    });
    return pipes;
  };
}

export function fetchRunState(pipeName: string) {
  const filePath = path.join(MARIO_CONFIG_PATH, pipeName, MARIO_RUNSTATE_FILENAME);
  const runState = fse.readJsonSync(filePath, { throws: false });

  return {
    type: FETCH_RUNSTATE_SUCCESS,
    data: {
      [pipeName]: runState && runState.current
    }
  };
}
