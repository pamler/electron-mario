const google = require('googleapis');
const auth = require('../auth');

class Drive {
  constructor() {
    this.drive = google.drive('v3');
    this.oauth2Client = auth.getClient();
  }

  async _createFolder(parentId, folderArray, resolve) {
    const fileMetadata = {
      name: folderArray[0],
      mimeType: 'application/vnd.google-apps.folder'
    };
    parentId && (fileMetadata.parents = [parentId]);

    const folderId = await this._ifExistFile('folder', folderArray[0], parentId);
    if (!folderId) {
      this.drive.files.create({
        resource: fileMetadata,
        fields: 'id',
        auth: this.oauth2Client,
      }, (err, file) => {
        if (err) {
          console.error(err);
        } else {
          folderArray.splice(0, 1);
          if (folderArray.length > 0) {
            this._createFolder(file.id, folderArray, resolve);
          } else {
            resolve(file.id);
          }
        }
      });
    } else {
      folderArray.splice(0, 1);
      if (folderArray.length > 0) {
        this._createFolder(folderId, folderArray, resolve);
      } else {
        resolve(folderId);
      }
    }
  }

  async _ifExistFile(type, name, parentId) {
    let query = `name = '${name}' and trashed = false `;
    if (type === 'doc') {
      query += 'and mimeType = \'application/vnd.google-apps.document\' ';
    } else if (type === 'folder') {
      query += 'and mimeType = \'application/vnd.google-apps.folder\' ';
    }
    parentId && (query += `and '${parentId}' in parents `);
    return new Promise((resolve, reject) => {
      this.drive.files.list({
        q: query,
        auth: this.oauth2Client,
      }, (err, res) => {
        if (err) {
          console.error(err);
        } else if (res.files && res.files.length) {
          resolve(res.files[0].id);
        } else {
          resolve();
        }
      });
    });
  }

  createFolderInGoogleDrive(path) {
    return new Promise((resolve, reject) => this._createFolder('', path, resolve));
  }

  deleteFile(fileId) {
    return new Promise((resolve, reject) => {
      this.drive.files.delete({
        fileId,
        auth: this.oauth2Client,
      }, (err, res) => {
        if (!err) resolve();
      });
    });
  }

  createDocInGoogleDrive(filename, folderId, buffer, mimeType) {
    const fileMetadata = {
      name: filename,
      mimeType: 'application/vnd.google-apps.document'
    };
    folderId && (fileMetadata.parents = [folderId]);

    const media = {
      mimeType: mimeType || 'text/plain',
      body: buffer
    };
    return new Promise(async (resolve, reject) => {
      const fileId = await this._ifExistFile('doc', filename, folderId);
      if (fileId) {
        await this.deleteFile(fileId);
      }
      this.drive.files.create({
        resource: fileMetadata,
        media,
        fields: 'id',
        auth: this.oauth2Client,
      }, (err, file) => {
        if (err) {
          // Handle error
          console.error(err);
        } else {
          resolve(file.id);
        }
      });
    });
  }
}

module.exports = Drive;
