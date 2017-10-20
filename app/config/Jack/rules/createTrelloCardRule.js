module.exports = (app, data, context) => {
  const fse = require('fs-extra');
  const { MARIO_CONFIG_PATH, MARIO_CONFIG_FILENAME } = require('../../../constants');
  const config = fse.readJsonSync(`${MARIO_CONFIG_PATH}/${context.name}/${MARIO_CONFIG_FILENAME}`);

  return app.getBoardByName('machine', { filter: 'open', fields: 'name' })
    .then((boardId) => app.getListByName(config.trello.list_name.value, boardId))
    .then((listId) => app.createCard(listId, { name: data.name }))
    .then((cardId) => app.attachCard(cardId, {
      name: config.trello.card_name.value,
      url: data.url
    }));
};
