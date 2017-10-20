import { MARIO_PATH } from '../../../../constants';

const fse = require('fs-extra');
const { ipcMain } = require('electron');
const GoogleAuth = require('google-auth-library');
const APP = require('../../constants');
const credentials = require('./.credentials/google.json');

// const TOKEN_DIR = `${__dirname}/lib/mario/apps/google/.credentials`;
const TOKEN_PATH = `${MARIO_PATH}/google-token.json`;

const SCOPE = {
  [APP.GMAIL]: ['https://www.googleapis.com/auth/gmail.readonly'],
  [APP.DRIVE]: ['https://www.googleapis.com/auth/drive'],
};

class Auth {
  constructor() {
    this.scope = [];
    this.oauth2Client = {};
    this.mainWindow = null;
    this.pipeName = '';
    this.promise = new Promise((resolve, reject) => {
      this.initializeListener(resolve, reject);
    });
  }

  initializeListener(resolve, reject) {
    ipcMain.on('google-auth-token', (event, code) => {
      this.oauth2Client.getToken(code, (err, token) => {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          if (this.mainWindow) {
            this.mainWindow.webContents.send(
              'auth-fail',
              JSON.stringify({ err: err.message, pipeName: this.pipeName, type: 'google' })
            );
            reject(err);
          }
        } else {
          this.oauth2Client.credentials = token;
          this.storeToken(token);
          resolve(this.oauth2Client);
          if (this.mainWindow) {
            this.mainWindow.webContents.send(
              'auth-success',
              JSON.stringify({ pipeName: this.pipeName, type: 'google' })
            );
          }
        }
      });
    });

    ipcMain.on('google-auth-fail', () => {
      reject('google auth fail');
      if (this.mainWindow) {
        this.mainWindow.webContents.send(
          'auth-fail',
          JSON.stringify({ err: 'google auth fail', pipeName: this.pipeName, type: 'google' })
        );
      }
    });
  }

  addScope(appType) {
    if (SCOPE[appType]) {
      this.scope = this.scope.concat(SCOPE[appType]);
    }
  }

  getNewToken(scope) {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope
    });
    this.mainWindow.webContents.send(
      'need-auth',
      JSON.stringify({ authUrl, pipeName: this.pipeName, type: 'google' })
    );
    return this.promise;
  }

  storeToken(token) {
    fse.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log(`Token stored to ${TOKEN_PATH}`);
  }

  authorize(pipeName, win) {
    const clientSecret = credentials.client_secret;
    const clientId = credentials.client_id;
    const redirectUrl = credentials.redirect_uris[0];
    const auth = new GoogleAuth();
    this.oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    this.mainWindow = win;
    this.pipeName = pipeName;

    return new Promise((resolve, reject) => {
      fse.readFile(TOKEN_PATH, (error, token) => {
        if (error) {
          this.getNewToken(this.scope)
            .then((client) => {
              this.oauth2Client = client;
              resolve(this.oauth2Client);
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          this.oauth2Client.credentials = JSON.parse(token);
          resolve(this.oauth2Client);
        }
      });
    });
  }

  getClient() {
    return this.oauth2Client;
  }
}

module.exports = new Auth();
