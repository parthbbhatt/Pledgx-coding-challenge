import React, { Fragment, useState } from 'react';
import Message from './Message';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState('');
  const [filename, setFilename] = useState('Choose File');
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState('');
  const [uploadDisabled, setUploadDisable] = useState(false);
  const [trainingDisabled, setTrainningDisable] = useState(false);

  const onChange = e => {
    if(e.target.files[0]) {
      setFile(e.target.files[0]);
      setFilename(e.target.files[0].name);
    } else {
      setFile(undefined);
      setFilename('');
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

      const { fileName, filePath } = res.data;

      setUploadedFile({ fileName, filePath });
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
      <div class="col text-center">
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
