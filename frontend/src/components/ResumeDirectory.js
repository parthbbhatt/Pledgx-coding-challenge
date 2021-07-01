import React, { useState } from 'react';
import axios from 'axios';
import ResumeAccordion from './ResumeAccordion';

const ResumeDirectory = () => {
    const [files, existingFiles] = useState(['Parth','aasd', 'guasd']);

    return(
        <div className="card">
            <div className="card-body">
                {files.length > 0 ?
                    <ResumeAccordion files={files} />
                    :
                    <h5 className="card-title">No resumes uploaded</h5>
                }
            </div>
        </div>
    );
};

export default ResumeDirectory;
