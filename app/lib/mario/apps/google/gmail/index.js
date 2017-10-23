const google = require('googleapis');
const gmailParser = require('gmail-parser');
const auth = require('../auth');

class Gmail {
  constructor(email) {
    this.name = 'gmail';
    this.email = email;
    this.gmail = google.gmail('v1');
    this.oauth2Client = auth.getClient();
  }

  listMessages(query) {
    return new Promise((resolve, reject) => {
      const request = (result, pageToken) => {
        const opts = {
          userId: this.email,
          q: query,
          auth: this.oauth2Client,
        };
        pageToken && (opts.pageToken = pageToken);
        this.gmail.users.messages.list(opts, (err, resp) => {
          if (resp) {
            result = result.concat(resp.messages);
            const nextPageToken = resp.nextPageToken;
            if (nextPageToken) {
              request(result, nextPageToken);
            } else {
              resolve(result);
            }
          }
        });
      };

      request([]);
    });
  }

  getMessageById(messageId) {
    return new Promise((resolve, reject) => {
      this.gmail.users.messages.get({
        userId: this.email,
        id: messageId,
        auth: this.oauth2Client,
        format: 'raw'
      }, (err, resp) => {
        if (!err) {
          const mail = gmailParser.parseGmail(resp);
          resolve(mail);
        } else {
          reject(err);
        }
      });
    });
  }

  setMessageLabelById(messageId, labels) {
    return new Promise((resolve, reject) => {
      this.gmail.users.labels.list({
        userId: this.email,
        auth: this.oauth2Client,
      }, (err, resp) => {
        const labelIds = resp.labels.map((label) => {
          if (labels.indexOf(label.name) !== -1) {
            return label.id;
          }
          return '';
        }).filter((id) => id !== '');
        this.gmail.users.messages.modify({
          userId: this.email,
          id: messageId,
          auth: this.oauth2Client,
          resource: {
            addLabelIds: labelIds
          }
        }, (err, resp) => {
          if (!err) {
            resolve(resp);
          } else {
            reject(err);
          }
        });
      });
    });
  }
}

module.exports = Gmail;
