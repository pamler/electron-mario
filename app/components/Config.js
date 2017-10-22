import React from 'react';
import { Input, Button, Alert, Icon } from 'antd/lib';
import styles from '../styles/Config.css';

const fse = require('fs-extra');

export default class Config extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: {}
    };
    this.onSave = this.onSave.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const newState = {};
    if (nextProps.app) {
      Object.keys(nextProps.configData).forEach((field) => {
        newState[field] = {
          disabled: true,
          value: nextProps.configData[field].value
        };
      });
      this.setState({
        data: newState
      });
    }
  }

  onSave() {
    const jsonObj = fse.readJsonSync(this.props.filePath);
    Object.keys(this.state.data).forEach((field) => {
      jsonObj[this.props.app][field].value = this.state.data[field].value;
    });
    fse.writeJsonSync(this.props.filePath, jsonObj);
  }

  render() {
    const { configData, onClose, app } = this.props;
    let fields = [];
    if (configData) {
      fields = Object.keys(configData).map((field) => (
        <div className={styles.field} key={field}>
          <span className={styles.label}>{configData[field].name}</span>
          <Input
            value={this.state.data[field].value}
            onChange={(e) => {
              this.state.data[field].value = e.target.value;
              this.setState({
                data: this.state.data
              });
            }}
            disabled={this.state.data[field].disabled}
            addonAfter={<Icon
              type="edit"
              onClick={() => {
                this.state.data[field].disabled = false;
                this.setState({
                  data: this.state.data
                });
              }}
            />}
          />
        </div>
      ));
    }
    return (
      <div className={styles.panel}>
        {
          app ?
            <Alert
              message={`${app} 配置`}
              description={
                <div>
                  {fields}
                  <Button type="primary" onClick={this.onSave}>save</Button>
                </div>
            }
              type="info"
              closable
              onClose={onClose}
            /> : null
        }
      </div>
    );
  }
}
