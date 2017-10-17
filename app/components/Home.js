import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Home.css';
import { Icon, Switch, Menu, Dropdown, Spin, Tag } from 'antd/lib';
import Auth from './Auth';
import { ipcRenderer } from 'electron';

const path = require('path');
const chokidar = require('chokidar');
const fse = require('fs-extra');

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      auth: {},
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

      watcher.on('change', (filePath, stats) => {
        const pipeName = filePath.split('/').slice(-3, -2);
        this.state.pipes[pipeName] = fse.readJsonSync(filePath, { throws: false });
        this.setState({
          pipes: this.state.pipes
        });
      });
    });

    ipcRenderer.on('need-auth', (event, message) => {
      const messageObj = JSON.parse(message);
      this.setState({
        auth: {
          ...this.state.auth,
          [messageObj.pipeName]: messageObj
        }
      });
    });
  }

  selectMenuItem(e, name) {
    if (e.key === 'run') {
      ipcRenderer.send('run-pipe', name);
    }
  }

  renderCell(name, data, index) {
    const menu = (
      <Menu onClick={(e) => this.selectMenuItem(e, name)}>
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

    if (data.workflow && data.workflow.split(',').length > 0) {
      const apps = data.workflow.split(',').map((item) => item.split('+')[0]);
      const appJSX = [];
      apps.forEach((icon) => {
        const stats = this.state.pipes[name] && this.state.pipes[name][icon];
        appJSX.push(
          <div key={icon} className={`${styles.appIcon} ${styles[icon]} ${styles[stats]}`}>
            {stats === 'success' && <Icon type="check-circle" className={styles.iconSuccess} />}
          </div>
        );
        appJSX.push(<Icon type="caret-right" style={{ color: '#666' }} />);
      });
      appJSX.pop();
      return (
        <div className={styles.cellWrapper} key={index}>
          <div className={styles.cell}>
            <div className={styles.row}>
              { appJSX }
            </div>
            <span className={styles.title}>
              {name}
            </span>
            <div className={styles.toolbar}>
              {
                this.state.pipes[name] && this.state.pipes[name].pipe === 'running' && <Spin size="small" style={{ marginRight: 30 }} />
              }
              {
                this.state.pipes[name] && this.state.pipes[name].pipe === 'fail' && <Tag style={{ marginRight: 30 }} color="red">failed</Tag>
              }
              {
                this.state.pipes[name] && this.state.pipes[name].pipe === 'success' && <Tag style={{ marginRight: 30 }} color="green">success</Tag>
              }
              <Switch defaultChecked={false} />
              <Dropdown
                overlay={menu}
                trigger={this.state.pipes[name] === 'running' ? [] : ['click']}
                placement="bottomLeft"
              >
                <Icon
                  type={this.state.pipes[name] === 'running' ? 'minus-circle-o' : 'down-circle-o'}
                  style={{ color: '#bbb', fontSize: 20, marginLeft: 20 }}
                />
              </Dropdown>
            </div>
          </div>
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
    return (
      <div className={styles.container}>
        {
          this.state.data ?
            <div>
              {
                Object.keys(this.state.data).map((pipeName, index) =>
                  this.renderCell(pipeName, this.state.data[pipeName], index))
              }
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
