// @flow
import { FETCH_RUNSTATE_SUCCESS } from '../actions';

type actionType = {
  +type: string,
  data?: Object
};

const INITAIL_STATE = {
};

export default function runstate(state: Object = INITAIL_STATE, action: actionType) {
  switch (action.type) {
    case FETCH_RUNSTATE_SUCCESS:
      return { ...state, ...action.data };
    default:
      return state;
  }
}
