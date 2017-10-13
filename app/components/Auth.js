import React, { Component } from 'react';
import { Alert, Input, Button } from 'antd/lib';
import { shell, ipcRenderer } from 'electron';

import styles from '../styles/Auth.css';

export default class Auth extends Component {

  renderContent(auth) {
    if (auth) {
      switch (auth.type) {
        case 'google':
          return (
            <Alert
              message="Google Authorization"
              description={
                <div>
                  <div>Google needs your authrization, Authorize this app by visiting this url: </div>
                  <a className={styles.link} onClick={() => shell.openExternal(auth.authUrl)}>Authorization Link</a>
                  <div>
                    <span>Then enter the authrization code: </span>
                    <Input placeholder="Please input the authrization code" />
                    <Button type="primary" className={styles.btnSave}>save</Button>
                  </div>
                </div>
              }
              type="warning"
              showIcon
              closable
              onClose={() => {
                ipcRenderer.send('google-auth-fail');
                this.props.onClose();
              }}
            />
          );
        default: return null;
      }
    } else {
      return null;
    }
  }

  render() {
    return (
      <div className={`${styles.warning} ${this.props.auth && styles.show}`}>
        {this.renderContent(this.props.auth)}
      </div>
    );
  }
}
