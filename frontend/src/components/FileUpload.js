import React, { Fragment, useState } from 'react';
import Message from './Message';
import axios from 'axios';
import { makeSelectResumes } from '../Store/selectors';
import { createSelector } from 'reselect';
import { useDispatch, useSelector, } from 'react-redux';
import { setResumes } from '../Store/actions';

const stateSelector = createSelector(makeSelectResumes, (existing_resumes) => ({
  existing_resumes
}));

const actionDispatcher = (dispatch) => ({
  setResumes: (existing_resumes) => dispatch(setResumes(existing_resumes))
});

const FileUpload = (props) => {
  const [file, setFile] = useState('');
  const [message, setMessage] = useState('');
  const [uploadDisabled, setUploadDisable] = useState(false);
  const [trainingDisabled, setTrainningDisable] = useState(false);

  const { existing_resumes } = useSelector(stateSelector);
  const { setResumes } = actionDispatcher(useDispatch());

  const onChange = e => {
    if(e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(undefined);
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await axios.post('http://127.0.0.1:5000/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: () => {
          setUploadDisable(true);
        }
      });

      setResumes(res.data.applicants);

      setMessage('Resume Uploaded');

    } catch (err) {
      if (err.response &&
          (err.response.status === 500 || 
          err.response.status === 404 || 
          err.response.status === 405)) {
        setMessage('There was a problem with the server');
      } else {
        if(!err.response) {
          setMessage('There was a problem with the server');
        } else {
          setMessage(err.response.data.msg);
        }
      }
    }

    setTimeout(() => setMessage(''), 6000);
    setUploadDisable(false);
  };


  const trainModel = async e => {
    e.preventDefault();

    try {
      setTrainningDisable(true);

      const res = await axios.get('http://127.0.0.1:5000/train');

      setMessage(res.data.training);

    } catch (err) {
      if (err.response && 
          (err.response.status === 500 || 
          err.response.status === 404 || 
          err.response.status === 405)) {
        setMessage('There was a problem with the server');
      } else {
        if(!err.response) {
          setMessage('There was a problem with the server');
        } else {
          setMessage(err.response.data.msg);
        }
      }
    }

    setTimeout(() => setMessage(''), 6000);
    setTrainningDisable(false);
  };

  return (
    <Fragment>
      {message ? <Message msg={message} /> : null}
      <form onSubmit={onSubmit}>
        <div className="input-group mb-4">
          <input
            type="file"
            className="form-control"
            id="inputGroupFile02"
            onChange={onChange}
            />

          {uploadDisabled ? (
            <button className="btn btn-primary" type="button" disabled>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span className="visually-hidden">Uploading...</span>
            </button> ) 
            : (
            <input
              disabled={uploadDisabled}
              type='submit'
              value='Upload'
              className='btn btn-primary btn-block'
              /> 
          )}
        </div>
      </form>
      <div className="col text-center">
        {trainingDisabled ? (
          <button className="btn btn-primary mb-4 center" type="button" disabled>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span className="visually-hidden">Training model...</span>
          </button> ) 
          : (
          <input
            disabled={uploadDisabled}
            type='button'
            value='Train model'
            className='btn btn-primary btn-block mb-4 center'
            onClick={trainModel}
            /> 
        )}
      </div>
    </Fragment>
  );
};

export default FileUpload;
