module.exports = (app, data, context) => {
  const fse = require('fs-extra');
  const { MARIO_CONFIG_PATH, MARIO_CONFIG_FILENAME } = require('../../../constants');
  const config = fse.readJsonSync(`${MARIO_CONFIG_PATH}/${context.name}/${MARIO_CONFIG_FILENAME}`);
  return app.listMessages(config.gmail.search_string.value)
    .then((msgData) => Promise.all(msgData.map((d) => d.id).map((id) => app.getMessageById(id))))
    .then((mails) => {
      const contents = mails.map((mail) => mail.content.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r'));
      return contents;
    });
};

