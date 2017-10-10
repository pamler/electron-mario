// @flow
import { app, Menu, Tray, BrowserWindow } from 'electron';

export default class MenuBuilder {
  tray: Tray;
  application: app;
  pipes: Object;

  constructor(application: app, tray: Tray, pipes: Object) {
    this.tray = tray;
    this.application = app;
    this.pipes = pipes;
  }

  createPipeMenu() {
    const pipeMenus = [];

    Object.keys(this.pipes).forEach((key) => {
      const pipeConfig = this.pipes[key];
      const pipe = { label: key, enabled: true };
      if (pipeConfig.status === 'enabled') {
        pipe.enabled = true;
        pipe.submenu = [];
      } else {
        pipe.enabled = false;
      }
      pipeMenus.push(pipe);
    });
    return pipeMenus;
  }

  buildTrayMenu({ createWindow }: { createWindow: () => BrowserWindow }) {
    const menuConfig = [
      { label: 'My Pipes', enabled: false },
      { type: 'separator' },
      { label: 'Configuration',
        click: () => {
          const mainWindow = createWindow();
          mainWindow.show();
        } },
      { label: 'Quit',
        click: () => {
          this.application.exit();
        } }
    ];

    const pipeMenus = this.createPipeMenu();
    pipeMenus.unshift(1, 0);
    Array.prototype.splice.apply(menuConfig, pipeMenus);
    const contextMenu = Menu.buildFromTemplate(menuConfig);
    this.tray.setContextMenu(contextMenu);
  }
}
