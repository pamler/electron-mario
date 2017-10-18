/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, Tray, ipcMain } from 'electron';
import MenuBuilder from './menu';

const Mario = require('./lib/mario');
const fse = require('fs-extra');
const path = require('path');

let mainWindow = null;
const marios = {};

app.dock.hide();

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log);
};

const createWindow = () => {
  if (!mainWindow) {
    mainWindow = new BrowserWindow({
      show: false,
      fullscreenable: false,
      resizable: false,
      width: 800,
      height: 600
    });

    mainWindow.loadURL(`file://${__dirname}/app.html`);

    // mainWindow.webContents.on('did-finish-load', () => {
    //   const pipeData = loadPipeConfig();
    //   mainWindow.webContents.send('data', JSON.stringify(pipeData));
    // });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }
  return mainWindow;
};

const loadPipeConfig = () => {
  const configDir = path.join(__dirname, 'config');
  const files = fse.readdirSync(configDir);
  const pipes = {};

  files.forEach((file) => {
    const pathname = path.join(configDir, file);
    const stat = fse.lstatSync(pathname);
    if (stat.isDirectory() && fse.existsSync(path.join(pathname, 'config.json'))) {
      const pipeConfig = fse.readJsonSync(path.join(pathname, 'config.json'));
      pipes[file] = pipeConfig;
    }
  });
  return pipes;
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const LOG_STATE_FILE_NAME = '.run-state.json';

app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }
  const pipes = loadPipeConfig();
  const tray = new Tray(path.join(__dirname, '..', 'resources', 'tray', 'status_bar_icon.png'));
  const menuBuilder = new MenuBuilder(app, tray, pipes);
  menuBuilder.buildTrayMenu({
    createWindow,
  });

  // Run the mario pipes
  Object.keys(pipes).forEach((key) => {
    if (pipes[key].status === 'enabled' && pipes[key].workflow) {
      let mario = new Mario({ config: pipes[key], name: key, loggerPath: path.join(__dirname, 'config', key, 'logs', LOG_STATE_FILE_NAME) });
      const pipArray = pipes[key].workflow.split(',');
      pipArray.forEach((pip) => {
        const service = pip.split('+')[0];
        const rule = pip.split('+')[1];
        mario = mario.pipe(service, require(path.join(__dirname, 'config', key, 'rules', rule)));
      });
      marios[key] = mario;
    }
  });
});

// click the mainWindow's button - [run]
ipcMain.on('run-pipe', (event, pipeName) => {
  marios[pipeName].run({
    mainWindow
  });
});
