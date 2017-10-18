// @flow
import { FETCH_WORKFLOW_SUCCESS } from '../actions';

type actionType = {
  +type: string,
  data?: Object
};

const INITAIL_STATE = {
};

export default function config(state: Object = INITAIL_STATE, action: actionType) {
  switch (action.type) {
    case FETCH_WORKFLOW_SUCCESS:
      return { ...action.data };
    default:
      return state;
  }
}
