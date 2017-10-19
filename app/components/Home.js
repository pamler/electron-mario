import React, { Component } from 'react';
import { Icon } from 'antd/lib';
import styles from '../styles/Home.css';
import Cell from './Cell';

const remote = require('electron').remote;

const path = require('path');
const fse = require('fs-extra');

const appPath = remote.app.getAppPath();

export default class Home extends Component {
  props: {
    fetchWorkflow: () => promise,
    fetchRunState: () => void,
    config: Object,
    runstate: Object
  };

  componentDidMount() {
    const { fetchWorkflow, fetchRunState } = this.props;
    const workflowData = fetchWorkflow();

    Object.keys(workflowData).forEach((pipeName) => {
      fetchRunState(pipeName);
      const logDir = path.join(appPath, 'config', pipeName, 'logs');
      fse.watch(logDir, (eventType, filename) => {
        if (eventType === 'change' && filename === '.run-state.json') {
          if (Object.keys(fse.readJsonSync(path.join(logDir, filename))).length) {
            fetchRunState(pipeName);
          }
        }
      });
    });
  }

  render() {
    const { config, runstate } = this.props;
    return (
      <div className={styles.container}>
        {
          config ?
            <div>
              {
                Object.keys(config).map((pipeName, index) =>
                  (<Cell
                    key={pipeName}
                    pipeName={pipeName}
                    stats={runstate[pipeName]}
                    workflow={config[pipeName]}
                    index={index}
                  />)
              )}
              <div className={styles.cellWrapper}>
                <div className={styles.cell}>
                  <Icon type="plus-circle-o" style={{ color: '#ddd', fontSize: 45, marginLeft: 10 }} />
                  <span className={styles.addNew}>add a new pipe</span>
                </div>
              </div>
            </div> :
            <div style={{ textAlign: 'center' }}>
              <Icon type="loading" className={styles.loading} />
            </div>
        }
      </div>
    );
  }
}
