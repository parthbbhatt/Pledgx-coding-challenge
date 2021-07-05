import { ActionTypes } from './constants';

const defaultState = {
  existing_resumes: [],
};

export default function resumeReducer(state = defaultState, action) {
  switch(action.type) {
    case ActionTypes.SET_RESUMES:
      return { ...state, existing_resumes: action.payload }
    default:
      return state;
  }
}
