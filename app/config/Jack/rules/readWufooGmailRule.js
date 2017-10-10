module.exports = (app) =>
  app.listMessages('from:no-reply@wufoo.com subject:Strikingly')
    .then((data) => app.getMessageById(data[0].id))
    .then((mail) => {
      mail.content = mail.content.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r');
      return mail.content;
    })
;
