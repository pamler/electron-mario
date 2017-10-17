import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { Icon, Switch, Menu, Dropdown, Spin, Tag } from 'antd/lib';

import styles from '../styles/Home.css';
import Auth from './Auth';
import Config from './Config';

const path = require('path');

export default class Cell extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedApp: '',
      auth: {},
    };
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
          <div
            key={icon}
            className={`${styles.appIcon} ${styles[icon]} ${styles[appStats]}`}
            onClick={() => this.setState({
              selectedApp: icon
            })}
          >
            {appStats === 'success' && <Icon type="check-circle" className={styles.iconSuccess} />}
          </div>
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
              {
                stats && stats.pipe === 'running' && <Spin size="small" style={{ marginRight: 30 }} />
              }
              {
                stats && stats.pipe === 'fail' && <Tag style={{ marginRight: 30 }} color="red">failed</Tag>
              }
              {
                stats && stats.pipe === 'success' && <Tag style={{ marginRight: 30 }} color="green">success</Tag>
              }
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
            filePath={path.join(__dirname, 'config', name, 'config.json')}
          />
          <Auth
            onClose={() => {
              this.state.auth[name] = null;
              this.setState({
                auth: this.state.auth,
              });
            }}
            auth={this.state.auth[name]}
          />
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
