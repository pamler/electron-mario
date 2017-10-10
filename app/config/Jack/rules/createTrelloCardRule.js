module.exports = (app, data) =>
  app.getBoardByName('machine', { filter: 'open', fields: 'name' })
    .then((boardId) => app.getListByName('resume', boardId))
    .then((listId) => app.createCard(listId, { name: data.name }))
    .then((cardId) => app.attachCard(cardId, {
      name: 'Wufoo Form',
      url: data.url
    }))
;
