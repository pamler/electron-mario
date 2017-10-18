// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import config from './config';
import runstate from './runstate';

const rootReducer = combineReducers({
  config,
  runstate,
  router
});

export default rootReducer;
