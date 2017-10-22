import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { Alert, Input, Button, message } from 'antd/lib';
import { shell, ipcRenderer } from 'electron';

import styles from '../styles/Auth.css';

export default class Auth extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isAuthorizing: false
    };
    this.saveToken = this.saveToken.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('auth-success', (event, msg) => {
      this.setState({
        isAuthorizing: false,
      });
    });

    ipcRenderer.on('auth-fail', (event, msg) => {
      const messageObj = JSON.parse(msg);
      message.error(messageObj.err);
      this.setState({
        isAuthorizing: false,
      });
    });
  }

  saveToken() {
    const value = ReactDom.findDOMNode(this.refs.codeInput).value;
    ipcRenderer.send('google-auth-token', value);
    this.setState({
      isAuthorizing: true
    });
  }

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
                    <Input placeholder="Please input the authrization code" ref="codeInput" />
                    <Button
                      loading={this.state.isAuthorizing}
                      type="primary"
                      className={styles.btnSave}
                      onClick={this.saveToken}
                    >
                      save
                    </Button>
                  </div>
                </div>
              }
              type="warning"
              showIcon
              closable
              onClose={() => {
                ipcRenderer.send('stop-auth');
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
    const { auth, name } = this.props;
    return (
      <div className={`${styles.warning} ${auth && styles.show}`}>
        {this.renderContent(auth)}
      </div>
    );
  }
}
