module.exports = (app, data) => {
  // extract candidate name from email content
  const pattern = data.replace(/\n|\r|\t/g, '').match(/<td id="roField1"[^>]*><div>([^<]*)<\/div><\/td>/);
  let fileName = 'form';
  if (pattern && pattern.length === 2) {
    fileName = pattern[1];
  }
  const date = `${new Date().getFullYear()}/${new Date().getMonth() + 1}`;
  return app.createFolderInGoogleDrive([date, fileName]).then((folderId) =>
    app.createDocInGoogleDrive(fileName, folderId, Buffer.from(data, 'utf8'), 'text/html')
      .then((fileId) => ({
        name: fileName,
        url: `https://docs.google.com/document/d/${fileId}`
      })
  ));
};
