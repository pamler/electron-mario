// @flow
const fse = require('fs-extra');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'config');

type actionType = {
  +type: string
};

export const FETCH_WORKFLOW_SUCCESS = 'FETCH_WORKFLOW_SUCCESS';
export const FETCH_RUNSTATE_SUCCESS = 'FETCH_RUNSTATE_SUCCESS';

export function fetchWorkflow() {
  const files = fse.readdirSync(CONFIG_PATH, { throws: false });
  const pipes = {};

  files.forEach((file) => {
    const pathname = path.join(CONFIG_PATH, file);
    const stat = fse.lstatSync(pathname);
    if (stat.isDirectory() && fse.existsSync(path.join(pathname, 'config.json'))) {
      const pipeConfig = fse.readJsonSync(path.join(pathname, 'config.json'));
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
  const filePath = path.join(CONFIG_PATH, pipeName, 'logs', '.run-state.json');
  const runState = fse.readJsonSync(filePath, { throws: false });

  return {
    type: FETCH_RUNSTATE_SUCCESS,
    data: {
      [pipeName]: runState
    }
  };
}
