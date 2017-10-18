import React, { Component } from 'react';
import { Icon } from 'antd/lib';
import styles from '../styles/Home.css';
import Cell from './Cell';

const path = require('path');
const chokidar = require('chokidar');

export default class Home extends Component {
  props: {
    fetchWorkflow: () => promise,
    fetchRunState: () => void,
    config: Object,
    runstate: Object
  };

  componentDidMount() {
    const watcher = chokidar.watch();

    const { fetchWorkflow, fetchRunState } = this.props;
    const workflowData = fetchWorkflow();
    Object.keys(workflowData).forEach((pipeName) => {
      fetchRunState(pipeName);
      watcher.add(path.join(__dirname, 'config', pipeName, 'logs', '.run-state.json'));
    });

    watcher.on('change', (filePath, stats) => {
      const pipeName = filePath.split('/').slice(-3, -2);
      if (stats.size > 5) {
        fetchRunState(pipeName[0]);
      }
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
