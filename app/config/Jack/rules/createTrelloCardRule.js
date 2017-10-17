module.exports = (app, data) => {
  const fse = require('fs-extra');
  const config = fse.readJsonSync(`${__dirname}/../config.json`);

  return app.getBoardByName('machine', { filter: 'open', fields: 'name' })
    .then((boardId) => app.getListByName(config.trello.list_name.value, boardId))
    .then((listId) => app.createCard(listId, { name: data.name }))
    .then((cardId) => app.attachCard(cardId, {
      name: config.trello.card_name.value,
      url: data.url
    }));
};
