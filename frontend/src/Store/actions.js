import { ActionTypes } from './constants';

export const setResumes = (existing_resumes) => ({
  type: ActionTypes.SET_RESUMES,
  payload: existing_resumes,
});
