import React, { Component } from 'react';
import { Icon } from 'antd/lib';
import { ipcRenderer } from 'electron';

import styles from '../styles/Home.css';
import Cell from './Cell';

const path = require('path');
const chokidar = require('chokidar');
const fse = require('fs-extra');

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      pipes: {}
    };
  }

  componentDidMount() {
    const watcher = chokidar.watch();

    ipcRenderer.on('data', (event, message) => {
      const workflowData = JSON.parse(message);
      this.setState({
        data: workflowData
      });

      Object.keys(workflowData).forEach((pipeName) => {
        const filePath = path.join(__dirname, 'config', pipeName, 'logs', 'run-state.json');
        watcher.add(filePath);
        this.state.pipes[pipeName] = fse.readJsonSync(filePath, { throws: false });
        this.setState({
          pipes: this.state.pipes
        });
      });

      watcher.on('change', (filePath) => {
        const pipeName = filePath.split('/').slice(-3, -2);
        this.state.pipes[pipeName] = fse.readJsonSync(filePath, { throws: false });
        this.setState({
          pipes: this.state.pipes
        });
      });
    });
  }

  render() {
    return (
      <div className={styles.container}>
        {
          this.state.data ?
            <div>
              {
                Object.keys(this.state.data).map((pipeName, index) =>
                  (<Cell
                    key={pipeName}
                    pipeName={pipeName}
                    stats={this.state.pipes[pipeName]}
                    workflow={this.state.data[pipeName]}
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
