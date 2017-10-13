const fse = require('fs-extra');
const { ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const GoogleAuth = require('google-auth-library');
const APP = require('../../constants');

const TOKEN_DIR = `${process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE}/.credentials/`;
const TOKEN_PATH = `${TOKEN_DIR}google-auth-nodejs.json`;

const SCOPE = {
  [APP.GMAIL]: ['https://www.googleapis.com/auth/gmail.readonly'],
  [APP.DRIVE]: ['https://www.googleapis.com/auth/drive'],
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(pipeName, mainWindow, oauth2Client, scope) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope
  });
  // console.log('Authorize this app by visiting this url: ', authUrl);
  mainWindow.webContents.send('need-auth', JSON.stringify({ authUrl, pipeName, type: 'google' }));

  return new Promise((resolve, reject) => {
    ipcMain.on('google-auth-sucess', (event, code) => {
      oauth2Client.getToken(code, (err, token) => {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          reject(err);
        }
        oauth2Client.credentials = token;
        storeToken(token);
        resolve(oauth2Client);
      });
    });
    ipcMain.on('google-auth-fail', (event, code) => {
      reject('google auth fail');
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fse.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  fse.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log(`Token stored to ${TOKEN_PATH}`);
}

class Auth {
  constructor() {
    this.scope = [];
    this.oauth2Client = {};
  }

  addScope(appType) {
    if (SCOPE[appType]) {
      this.scope = this.scope.concat(SCOPE[appType]);
    }
  }

  authorize(pipeName, mainWindow) {
    const credentials = fse.readJsonSync(path.join(__dirname, 'google.json'));
    const clientSecret = credentials.client_secret;
    const clientId = credentials.client_id;
    const redirectUrl = credentials.redirect_uris[0];
    const auth = new GoogleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    return new Promise((resolve, reject) => {
      fse.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
          getNewToken(pipeName, mainWindow, oauth2Client, this.scope)
            .then((client) => {
              this.oauth2Client = client;
              resolve(this.oauth2Client);
            });
        } else {
          oauth2Client.credentials = JSON.parse(token);
          this.oauth2Client = oauth2Client;
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
