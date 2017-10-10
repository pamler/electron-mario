const GOOGLE_FAMILY = ['gmail', 'drive'];

module.exports = {
  GMAIL: 'gmail',
  DRIVE: 'drive',
  TRELLO: 'trello',

  isBelongToGoogle(type) {
    return GOOGLE_FAMILY.indexOf(type) !== -1;
  }
};
