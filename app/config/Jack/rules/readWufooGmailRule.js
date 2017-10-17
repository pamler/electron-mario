module.exports = (app) => {
  const fse = require('fs-extra');
  const config = fse.readJsonSync('../config.json');

  return app.listMessages(config.gmail.search_string.value)
    .then((data) => app.getMessageById(data[0].id))
    .then((mail) => {
      mail.content = mail.content.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r');
      return mail.content;
    });
};

