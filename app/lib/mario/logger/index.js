const fse = require('fs-extra');

class Logger {
  constructor(logPath) {
    this.logPath = logPath;
  }

  logState(keyValue) {
    let jsonData = fse.readJsonSync(this.logPath, { throws: false });
    jsonData = jsonData || {};
    jsonData = {
      ...jsonData,
      ...keyValue
    };
    fse.outputJsonSync(this.logPath, jsonData);
  }

  emptyState() {
    fse.outputJsonSync(this.logPath, {});
  }

  getAppState(app) {
    const jsonData = fse.readJsonSync(this.logPath, { throws: false });
    return jsonData[app];
  }
}

module.exports = Logger;
