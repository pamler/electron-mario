const fse = require('fs-extra');

class Logger {
  constructor(logPath) {
    this.logPath = logPath;
  }

  logState(keyValue) {
    let jsonData = fse.readJsonSync(this.logPath, { throws: false });
    jsonData = jsonData || { current: {}, history: [] };
    jsonData.current = {
      ...jsonData.current,
      ...keyValue
    };
    fse.outputJsonSync(this.logPath, jsonData);
  }

  saveState() {
    const jsonData = fse.readJsonSync(this.logPath, { throws: false });
    jsonData.history = jsonData.history || [];
    jsonData.history.unshift(jsonData.current);
    fse.outputJsonSync(this.logPath, jsonData);
  }

  emptyCurrentState() {
    const jsonData = fse.readJsonSync(this.logPath, { throws: false });
    jsonData.current = {};
    fse.outputJsonSync(this.logPath, jsonData);
  }

  getAppState(app) {
    const jsonData = fse.readJsonSync(this.logPath, { throws: false });
    return jsonData.current[app];
  }
}

module.exports = Logger;
