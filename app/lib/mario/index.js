const AppFactory = require('./apps');
const App = require('./constants');
const Logger = require('./logger');

const googleAuth = require('./apps/google/auth');

class Mario {
  constructor({ config, name, loggerPath }) {
    this.chainable = [];
    this.auths = {};
    this.config = config;
    this.name = name;
    this.logger = new Logger(loggerPath);
  }

  pipe(appType, rules) {
    this.chainable.push({
      type: appType,
      fn: (recvData) => {
        this.logger.logState({ [appType]: 'running' });
        const app = AppFactory.createApp(appType, this.config);
        return rules(app, recvData).then((data) => {
          this.logger.logState({ [appType]: 'success' });
          return Promise.resolve(data);
        }).catch((e) => {
          this.logger.logState({ [appType]: 'fail' });
        });
      }
    });
    if (App.isBelongToGoogle(appType)) {
      !this.auths.google && (this.auths.google = googleAuth);
      this.auths.google.addScope(appType);
    }
    return this;
  }

  run({ mainWindow }) {
    this.logger.emptyState();
    this.logger.logState({ pipe: 'running', startTime: new Date() });

    let promiseChain = new Promise((resolve) => resolve());
    Object.keys(this.auths).forEach((key) => {
      promiseChain = promiseChain.then(() => this.auths[key].authorize(this.name, mainWindow));
    });

    this.chainable.forEach((spider) => {
      promiseChain = promiseChain.then(spider.fn);
    });
    return promiseChain.then(() => {
      this.chainable.forEach((spider) => {
        const state = this.logger.getAppState(spider.type);
        if (state === 'fail') {
          this.logger.logState({ pipe: 'fail' });
          return Promise.reject(spider.type);
        }
      });
      this.logger.logState({ pipe: 'success' });
      return Promise.resolve();
    }).catch((e) => {
      console.log(e);
      this.logger.logState({ pipe: 'fail' });
      return Promise.reject(e);
    });
  }
}

module.exports = Mario;
