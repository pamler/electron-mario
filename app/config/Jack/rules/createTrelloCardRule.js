module.exports = (app, data, context) => {
  const fse = require('fs-extra');
  const { MARIO_CONFIG_PATH, MARIO_CONFIG_FILENAME } = require('../../../constants');
  const config = fse.readJsonSync(`${MARIO_CONFIG_PATH}/${context.name}/${MARIO_CONFIG_FILENAME}`);

  let promise = app.getBoardByName('machine', { filter: 'open', fields: 'name' });
  for (let i = 0; i < data.length; i++) {
    promise = promise
      .then((boardId) => app.getListByName(config.trello.list_name.value, boardId))
      .then((listId) => app.createCard(listId, { name: data[i].name }))
      .then((cardId) => app.attachCard(cardId, {
        name: config.trello.card_name.value,
        url: data[i].url
      }));
  }
  return promise;
};
