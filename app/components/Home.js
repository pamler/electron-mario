import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.css';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Switch from 'antd/lib/switch';
import Menu from 'antd/lib/menu';
import Dropdown from 'antd/lib/dropdown';

import { ipcRenderer } from 'electron';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null
    };
  }

  componentDidMount() {
    ipcRenderer.on('data', (event, message) => {
      this.setState({
        data: JSON.parse(message)
      });
    });
  }

  renderCell(name, data, index) {
    const menu = (
      <Menu>
        <Menu.Item>
          <div className={styles.menuItem}>
            <Icon type="caret-right" className={styles.menuIcon} /> Run
          </div>
        </Menu.Item>
        <Menu.Item>
          <div className={styles.menuItem}>
            <Icon type="edit" className={styles.menuIcon} /> Edit
          </div>
        </Menu.Item>
        <Menu.Item>
          <div className={styles.menuItem}>
            <Icon type="file-text" className={styles.menuIcon} /> View Log
          </div>
        </Menu.Item>
        <Menu.Item>
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
        appJSX.push(<div key={icon} className={`${styles.appIcon} ${styles[icon]}`} />);
        appJSX.push(<Icon type="caret-right" style={{ color: '#666' }} />);
      });
      appJSX.pop();
      return (
        <div className={styles.cell} key={index}>
          <div className={styles.row}>
            { appJSX }
          </div>
          <span className={styles.title}>{name}</span>
          <div className={styles.toolbar}>
            <Switch defaultChecked={false} />
            <Dropdown overlay={menu} placement="bottomLeft">
              <Icon type="down-circle-o" style={{ color: '#bbb', fontSize: 20, marginLeft: 20 }} />
            </Dropdown>
          </div>
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
          Object.keys(this.state.data).map((pipeName, index) =>
            this.renderCell(pipeName, this.state.data[pipeName], index)
          ) :
          <div style={{ textAlign: 'center' }}>
            <Icon type="loading" className={styles.loading} />
          </div>
        }
      </div>
    );
  }
}
