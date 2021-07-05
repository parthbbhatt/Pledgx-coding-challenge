import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResumeAccordion from './ResumeAccordion';
import { useDispatch, useSelector, } from 'react-redux';
import { setResumes } from '../Store/actions';
import { makeSelectResumes } from '../Store/selectors';
import { createSelector } from 'reselect';

const stateSelector = createSelector(makeSelectResumes, (existing_resumes) => ({
    existing_resumes
}));
  
const actionDispatcher = (dispatch) => ({
    setResumes: (existing_resumes) => dispatch(setResumes(existing_resumes))
});

const ResumeDirectory = () => {
    const { existing_resumes } = useSelector(stateSelector);
    const { setResumes } = actionDispatcher(useDispatch());

    useEffect(() => {
        const res = axios.get('http://127.0.0.1:5000/').then((res) => {
            setResumes(res.data.applicants);
        });
    }, []);

    return(
        <div className="card">
            <div className="card-body">
                {existing_resumes.length > 0 ?
                    <ResumeAccordion existing_resumes={existing_resumes} />
                    :
                    <h5 className="card-title">No resumes uploaded</h5>
                }
            </div>
        </div>
    );
};

export default ResumeDirectory;
