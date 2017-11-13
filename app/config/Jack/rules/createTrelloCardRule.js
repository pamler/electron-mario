module.exports = (app, data, context) => {
  const fse = require('fs-extra');
  const { MARIO_CONFIG_PATH, MARIO_CONFIG_FILENAME } = require('../../../constants');
  const config = fse.readJsonSync(`${MARIO_CONFIG_PATH}/${context.name}/${MARIO_CONFIG_FILENAME}`);

  const promise = app.getBoardByName(config.trello.board_name.value, { filter: 'open', fields: 'name' })
    .then((boardId) => app.getListByName(config.trello.list_name.value, boardId))
    .then((listId) => Promise.all(
      data.map(
        (d) => app.createCard(listId, { name: d.name })
                  .then((cardId) => app.attachCard(cardId, {
                    name: config.trello.card_name.value,
                    url: d.url
                  }))
    )));
  return promise;
};
