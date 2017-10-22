import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { Icon, message, Upload } from 'antd/lib';
import { MARIO_CONFIG_PATH, MARIO_CONFIG_FILENAME, MARIO_RUNSTATE_FILENAME } from '../constants';
import styles from '../styles/Home.css';
import Cell from './Cell';

const Dragger = Upload.Dragger;
const path = require('path');
const fse = require('fs-extra');

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
      this.watchFile(pipeName);
    });
  }

  watchFile(pipeName) {
    const { fetchWorkflow, fetchRunState } = this.props;
    const logDir = path.join(MARIO_CONFIG_PATH, pipeName);
    fse.watch(logDir, (eventType, filename) => {
      if (eventType === 'change' || eventType === 'rename') {
        if (filename === MARIO_RUNSTATE_FILENAME) {
          if (Object.keys(fse.readJsonSync(path.join(logDir, filename))).length) {
            fetchRunState(pipeName);
          }
        } else if (filename === MARIO_CONFIG_FILENAME) {
          fetchWorkflow();
        }
      }
    });
  }

  render() {
    const { fetchWorkflow, config, runstate } = this.props;
    const fileUploadProps = {
      name: 'file',
      multiple: false,
      showUploadList: false,
      onChange: (info) => {
        const status = info.file.status;
        if (status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (status === 'done') {
          const realName = info.file.name.split('.')[0];
          fse.outputJsonSync(`${MARIO_CONFIG_PATH}/${realName}/config.json`, fse.readJsonSync(info.file.originFileObj.path));
          this.watchFile(realName);
          ipcRenderer.send('set-pipe');
          fetchWorkflow();
        } else if (status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        }
      },
    };
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
              <Dragger {...fileUploadProps}>
                <div className={styles.cell}>
                  <Icon type="plus-circle-o" style={{ color: '#ddd', fontSize: 45, marginLeft: 10 }} />
                  <span className={styles.addNew}>add a new pipe</span>
                </div>
              </Dragger>
            </div> :
            <div style={{ textAlign: 'center' }}>
              <Icon type="loading" className={styles.loading} />
            </div>
        }
      </div>
    );
  }
}
