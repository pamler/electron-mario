// @flow
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as MarioActions from '../actions';

import Home from '../components/Home';

function mapStateToProps(state) {
  return {
    config: state.config,
    runstate: state.runstate
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(MarioActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
