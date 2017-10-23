// @flow
import { app, Menu, Tray, BrowserWindow, globalShortcut } from 'electron';

let menuConfig;
export default class MenuBuilder {
  tray: Tray;
  application: app;

  constructor(application: app, tray: Tray) {
    this.tray = tray;
    this.application = app;
  }

  createPipeMenu(pipes, logs) {
    const pipeMenus = [];
    Object.keys(pipes).forEach((key) => {
      const pipeConfig = pipes[key];
      const pipe = { label: key, enabled: true };
      if (pipeConfig.status === 'enabled') {
        pipe.enabled = true;
        pipe.submenu = logs && logs[key] ? logs[key].map((item) =>
          ({
            label: `${item.endTime.substr(0, 19)} ${item.pipe}`,
            enabled: false
          })
        ) : [];
      } else {
        pipe.enabled = false;
      }
      pipeMenus.push(pipe);
    });
    return pipeMenus;
  }

  combineMenus(pipes, logs) {
    const pipeMenus = this.createPipeMenu(pipes, logs);
    let sectionPipeIndex = 1;
    for (let i = 0; i < menuConfig.length; i++) {
      if (menuConfig[i].type === 'separator') {
        sectionPipeIndex = i;
        break;
      }
    }
    menuConfig.splice(1, sectionPipeIndex - 1);
    pipeMenus.unshift(1, 0);
    Array.prototype.splice.apply(menuConfig, pipeMenus);
    const contextMenu = Menu.buildFromTemplate(menuConfig);
    this.tray.setContextMenu(contextMenu);
  }

  buildTrayMenu({ createWindow, pipes, logs }) {
    menuConfig = [
      { label: 'My Pipes', enabled: false },
      { type: 'separator' },
      { label: 'Configuration...',
        accelerator: 'CmdOrCtrl+,',
        click: () => {
          const mainWindow = createWindow();
          mainWindow.show();
        } },
      { label: 'Debug',
        accelerator: 'CmdOrCtrl+Option+I',
        click: () => {
          const mainWindow = createWindow();
          mainWindow.show();
          mainWindow.openDevTools();
        } },
      { label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          this.application.exit();
        } }
    ];

    globalShortcut.register('CmdOrCtrl+Q', () => {
      this.application.exit();
    });
    globalShortcut.register('CmdOrCtrl+,', () => {
      const mainWindow = createWindow();
      mainWindow.show();
    });
    globalShortcut.register('CmdOrCtrl+Option+I', () => {
      const mainWindow = createWindow();
      mainWindow.show();
      mainWindow.openDevTools();
    });

    this.combineMenus(pipes, logs);
  }

  buildMenu() {
    const template = [{
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
      ]
    }];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }
}
