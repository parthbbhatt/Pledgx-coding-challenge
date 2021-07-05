import { createSelector } from 'reselect';

const resumeState = (state) => state.resume;

export const makeSelectResumes = createSelector(resumeState, resume => resume.existing_resumes);
