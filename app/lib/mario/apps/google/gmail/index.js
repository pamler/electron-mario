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
        }
      });
    });
  }
}

module.exports = Gmail;
