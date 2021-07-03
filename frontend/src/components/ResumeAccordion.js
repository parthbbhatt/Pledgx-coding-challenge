import React from 'react';
import PropTypes from 'prop-types';

const ResumeAccordion = ({ files }) => {
    return(
        <div>
            <h5 className="card-title mb-4">Uploaded resumes</h5>
            <div className="accordion" id="accordionExample">
                {files.map((resume, index) => {
                    return(
                        <div className="accordion-item" id={index} key={index}>
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" 
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={"#collapse" + index}
                                aria-expanded="true"
                                aria-controls={"#collapse" + index}>
                                {resume}
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
                                                <td>Parth Brahmbhatt</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Email</th>
                                                <td>Parth Brahmbhatt</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Contact number</th>
                                                <td>Parth Brahmbhatt</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Location</th>
                                                <td>Parth Brahmbhatt</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Skills</th>
                                                <td>Parth Brahmbhatt</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Projects</th>
                                                <td>Parth Brahmbhatt</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Work Experience</th>
                                                <td>Parth Brahmbhatt</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Education</th>
                                                <td>Parth Brahmbhatt</td>
                                            </tr>
                                        </tbody>
                                    </table>
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
