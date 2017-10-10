const AppFactory = require('./apps');
const App = require('./constants');

const googleAuth = require('./apps/google/auth');

class Mario {
  constructor(config) {
    this.chainable = [];
    this.auths = {};
    this.config = config;
  }

  pipe(appType, rules) {
    this.chainable.push({
      type: appType,
      fn: (recvData) => {
        const app = AppFactory.createApp(appType, this.config);
        return rules(app, recvData);
      }
    });
    if (App.isBelongToGoogle(appType)) {
      !this.auths.google && (this.auths.google = googleAuth);
      this.auths.google.addScope(appType);
    }
    return this;
  }

  run() {
    let promiseChain = new Promise((resolve) => resolve());
    Object.keys(this.auths).forEach((key) => {
      promiseChain = promiseChain.then(() => this.auths[key].authorize());
    });

    this.chainable.forEach((spider) => {
      promiseChain = promiseChain.then(spider.fn);
    });
  }
}

module.exports = Mario;
