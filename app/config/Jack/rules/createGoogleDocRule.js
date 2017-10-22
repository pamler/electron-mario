module.exports = (app, data, context) => {
  const fse = require('fs-extra');
  const { MARIO_CONFIG_PATH, MARIO_CONFIG_FILENAME } = require('../../../constants');
  const config = fse.readJsonSync(`${MARIO_CONFIG_PATH}/${context.name}/${MARIO_CONFIG_FILENAME}`);

  // extract candidate name from email content
  const patterns = data.map((d) => d.replace(/\n|\r|\t/g, '').match(config.drive.regex_field.value));
  const fileNames = patterns.map((pattern, index) => {
    if (pattern && pattern.length === 2) {
      return pattern[1];
    }
    return `form-${index}`;
  });
  const date = `${new Date().getFullYear()}/${new Date().getMonth() + 1}`;
  let promise = Promise.resolve();
  for (let i = 0; i < fileNames.length; i++) {
    const fileName = fileNames[i];
    promise = promise.then(() => app.createFolderInGoogleDrive([date, fileName]))
      .then((folderId) => app.createDocInGoogleDrive(fileName, folderId, Buffer.from(data[i], 'utf8'), 'text/html'))
      .then((fileId) => ({
        name: fileName,
        url: `https://docs.google.com/document/d/${fileId}`
      }));
  }
  return promise;
};
