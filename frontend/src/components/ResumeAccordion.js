import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
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

const ResumeAccordion = ({ existing_resumes }) => {
    const { setResumes } = actionDispatcher(useDispatch());
    
    console.log(existing_resumes);

    const onDelete = async e => {
        const data = {
            applicant_id: e.target.id,
            resume_id: e.target.getAttribute('resume_id'),
        }

        console.log(data)
        
        axios.delete('http://127.0.0.1:5000/', {
            headers: {
                'Content-Type': 'application/json'
            },
            data
        }).then((res) => {
            setResumes(res.data.applicants);
        });
    }


    return(
        <div>
            <h5 className="card-title mb-4">Uploaded resumes</h5>
            <div className="accordion" id="accordionExample">
                {existing_resumes.map((resume, index) => {
                    return(
                        <div className="accordion-item" id={index} key={index}>
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" 
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={"#collapse" + index}
                                aria-expanded="true"
                                aria-controls={"#collapse" + index}>
                                {resume.email}
                                </button>
                            </h2>
                            <div id={"collapse" + index}
                             className="accordion-collapse collapse" 
                             aria-labelledby="headingOne" 
                             data-bs-parent="#accordionExample">
                                <div className="accordion-body">
                                    <table className="table table-bordered">
                                        <tbody>
                                            <tr>
                                                <th scope="row">Name</th>
                                                <td>{resume.name}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Contact number</th>
                                                <td>{resume.phone}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Location</th>
                                                <td>{resume.location}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Skills</th>
                                                <td>{resume.applicant_resume[0].skills}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Work Experience</th>
                                                <td>{resume.applicant_resume[0].work_experience}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">School</th>
                                                <td>{resume.applicant_resume[0].college}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Education</th>
                                                <td>{resume.applicant_resume[0].degree}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <button 
                                        className="btn btn-danger" 
                                        onClick={onDelete}
                                        id={resume.id} 
                                        resume_id={resume.applicant_resume[0].id} 
                                        type="button"
                                    >
                                            Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


ResumeAccordion.propTypes = {
    files: PropTypes.array.isRequired
};

export default ResumeAccordion;
