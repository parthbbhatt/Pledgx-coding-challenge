import React, { Fragment, useState } from 'react';
import Message from './Message';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState('');
  const [filename, setFilename] = useState('Choose File');
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState('');
  const [uploadDisabled, setUploadDisable] = useState(false);

  const onChange = e => {
    setFile(e.target.files[0]);
    setFilename(e.target.files[0].name);
  };

  const onSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/upload', formData, {
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
      if (err.response.status === 500 || err.response.status === 404) {
        setMessage('There was a problem with the server');
      } else {
        setMessage(err.response.data.msg);
      }
    }

    setUploadDisable(false);
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
    </Fragment>
  );
};

export default FileUpload;
