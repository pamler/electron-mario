const APP = require('../constants');

const GmailApp = require('./google/gmail');
const DriveApp = require('./google/drive');

const TrelloApp = require('./trello');

module.exports = {
  createApp: (appType, config) => {
    switch (appType) {
      case APP.GMAIL:
        return new GmailApp(config.gmail.target_email);
      case APP.DRIVE:
        return new DriveApp();
      case APP.TRELLO:
        return new TrelloApp(config.auth.trello.publicKey, config.auth.trello.token);
      default: break;
    }
  }
};
