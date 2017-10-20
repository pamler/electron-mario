const NodeTrello = require('node-trello');

class Trello {
  constructor(publicKey, token) {
    this.name = 'trello';
    this.trello = new NodeTrello(publicKey, token);
  }

  getBoardByName(name, params = {}) {
    const query = Object.keys(params).map((key) => `${key}=${params[key]}`) || [];
    return new Promise((resolve, reject) => {
      this.trello.get(`/1/members/me/boards?${query.join('&')}`, (err, data) => {
        if (err) reject(err);
        let boardId = '';
        for (let i = 0; i < data.length; i++) {
          if (data[i].name === name) {
            boardId = data[i].id;
            break;
          }
        }
        resolve(boardId);
      });
    });
  }

  getListByName(name, boardId, params = {}) {
    const query = Object.keys(params).map((key) => `${key}=${params[key]}`) || [];
    return new Promise((resolve, reject) => {
      this.trello.get(`/1/boards/${boardId}/lists${query.join('&')}`, (err, data) => {
        if (err) reject(err);
        let listId = '';
        for (let i = 0; i < data.length; i++) {
          if (data[i].name === name) {
            listId = data[i].id;
            break;
          }
        }
        resolve(listId);
      });
    });
  }

  createCard(listId, params = {}) {
    return new Promise((resolve, reject) => {
      this.trello.post(`/1/cards?idList=${listId}`, params, (err, data) => {
        if (err) reject(err);
        resolve(data.id);
      });
    });
  }

  attachCard(cardId, attachments = {}) {
    return new Promise((resolve, reject) => {
      this.trello.post(`/1/cards/${cardId}/attachments`, attachments, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }
}

module.exports = Trello;
