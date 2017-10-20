import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { Icon, Switch, Menu, Dropdown, Spin } from 'antd/lib';

import { MARIO_CONFIG_PATH, MARIO_CONFIG_FILENAME } from '../constants';
import styles from '../styles/Home.css';
import Auth from './Auth';
import Config from './Config';

const path = require('path');

export default class Cell extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedApp: '',
      auth: null,
    };
  }

  componentDidMount() {
    ipcRenderer.on('need-auth', (event, msg) => {
      const messageObj = JSON.parse(msg);
      if (messageObj.pipeName === this.props.pipeName) {
        this.setState({
          auth: messageObj
        });
      }
    });

    ipcRenderer.on('auth-success', (event, msg) => {
      const messageObj = JSON.parse(msg);
      if (messageObj.pipeName === this.props.pipeName) {
        this.setState({
          auth: null,
        });
      }
    });
  }

  selectMenuItem(e) {
    if (e.key === 'run') {
      ipcRenderer.send('run-pipe', this.props.pipeName);
    }
  }

  renderMenu() {
    return (
      <Menu onClick={(e) => this.selectMenuItem(e, this.props.pipeName)}>
        <Menu.Item key="run">
          <div className={styles.menuItem}>
            <Icon type="caret-right" className={styles.menuIcon} /> Run
          </div>
        </Menu.Item>
        <Menu.Item key="edit">
          <div className={styles.menuItem}>
            <Icon type="edit" className={styles.menuIcon} /> Edit
          </div>
        </Menu.Item>
        <Menu.Item key="log">
          <div className={styles.menuItem}>
            <Icon type="file-text" className={styles.menuIcon} /> View Log
          </div>
        </Menu.Item>
        <Menu.Item key="delete">
          <div className={styles.menuItem}>
            <Icon type="delete" className={styles.menuIcon} /> Delete
          </div>
        </Menu.Item>
      </Menu>
    );
  }

  renderContent(name, stats, data) {
    if (data.workflow && data.workflow.split(',').length > 0) {
      const apps = data.workflow.split(',').map((item) => item.split('+')[0]);
      const appJSX = [];
      apps.forEach((icon) => {
        const appStats = stats && stats[icon];
        appJSX.push(
          <Spin key={icon} spinning={appStats === 'running'}>
            <div
              className={`${styles.appIcon} ${styles[icon]} ${this.state.selectedApp === icon ? styles.selected : ''}`}
              onClick={() => this.setState({
                selectedApp: icon
              })}
            >
              {appStats === 'success' && <Icon type="check-circle" className={styles.iconSuccess} />}
              {appStats === 'fail' && <Icon type="exclamation-circle" className={styles.iconFail} />}
            </div>
          </Spin>
        );
        appJSX.push(<Icon key={`${icon}-caret-right`} type="caret-right" style={{ color: '#666' }} />);
      });
      appJSX.pop();

      return (
        <div className={styles.cellWrapper}>
          <div className={styles.cell}>
            <div className={styles.row}>
              { appJSX }
            </div>
            <span className={styles.title}>
              {name}
            </span>
            <div className={styles.toolbar}>
              <Switch defaultChecked={false} />
              <Dropdown
                overlay={this.renderMenu()}
                trigger={stats && stats.pipe === 'running' ? [] : ['click']}
                placement="bottomLeft"
              >
                <Icon
                  type={stats && stats.pipe === 'running' ? 'minus-circle-o' : 'down-circle-o'}
                  style={{ color: '#bbb', fontSize: 20, marginLeft: 20 }}
                />
              </Dropdown>
            </div>
          </div>
          <Config
            configData={data[this.state.selectedApp]}
            app={this.state.selectedApp}
            onClose={() => this.setState({ selectedApp: '' })}
            filePath={path.join(MARIO_CONFIG_PATH, name, MARIO_CONFIG_FILENAME)}
          />
          <Auth auth={this.state.auth} onClose={() => this.setState({ auth: null })} />
        </div>
      );
    }
    return null;
  }

  render() {
    const { pipeName, stats, workflow } = this.props;
    return this.renderContent(pipeName, stats, workflow);
  }
}
