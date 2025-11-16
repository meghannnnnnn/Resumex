'use client';

import { useState, useEffect } from 'react';
import { FaSpinner, FaBriefcase, FaCheck, FaBuilding, FaMapMarkerAlt, FaRegClock, FaExternalLinkAlt, FaSync } from 'react-icons/fa';

export default function JobMatches({ jobs, isLoading, error }) {
  const [expandedJob, setExpandedJob] = useState(null);
  const [formattedJobs, setFormattedJobs] = useState([]);
  const [liveJobs, setLiveJobs] = useState({});
  const [fetchingLiveJobs, setFetchingLiveJobs] = useState({});

  useEffect(() => {
    // Process and normalize jobs data from Gemini API
    if (jobs) {
      if (Array.isArray(jobs)) {
        // If already an array, use it directly
        setFormattedJobs(jobs);
      } else if (jobs.raw) {
        // If we got a raw text response
        console.log("Raw response from API:", jobs.raw);
        setFormattedJobs([{
          title: "Response Processing Error",
          description: "The AI returned a response in an unexpected format. Please try again.",
          requiredSkills: ["Try uploading a different resume"],
          company: "Unknown",
          location: "Unknown",
          type: "Unknown"
        }]);
      } else {
        // If it's an object but not an array, try to extract jobs
        try {
          // Check if there's any array property in the object that might contain jobs
          const possibleJobsArray = Object.values(jobs).find(val => Array.isArray(val));
          if (possibleJobsArray) {
            setFormattedJobs(possibleJobsArray);
          } else {
            // Create a single job entry from the object
            setFormattedJobs([{
              title: jobs.title || "Job Match",
              description: jobs.description || "No description available",
              requiredSkills: jobs.requiredSkills || Array.isArray(jobs.skills) ? jobs.skills : ["No skills listed"],
              company: jobs.company || "Unknown",
              location: jobs.location || "Unknown",
              type: jobs.type || "Unknown"
            }]);
          }
        } catch (err) {
          console.error("Error formatting jobs:", err);
          setFormattedJobs([{
            title: "Data Processing Error",
            description: "There was an error processing the job matches data.",
            requiredSkills: ["Please try again"],
            company: "Error",
            location: "Unknown",
            type: "Unknown"
          }]);
        }
      }
    } else {
      // No jobs data
      setFormattedJobs([]);
    }
  }, [jobs]);

  const fetchLiveJobsForCompany = async (company, index) => {
    if (fetchingLiveJobs[index]) return;
    
    setFetchingLiveJobs(prev => ({ ...prev, [index]: true }));
    
    try {
      const response = await fetch(`/api/live-jobs?company=${encodeURIComponent(company)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch live jobs');
      }
      
      const data = await response.json();
      setLiveJobs(prev => ({ ...prev, [index]: data.jobs }));
    } catch (error) {
      console.error('Error fetching live jobs:', error);
      setLiveJobs(prev => ({ ...prev, [index]: { error: error.message } }));
    } finally {
      setFetchingLiveJobs(prev => ({ ...prev, [index]: false }));
    }
  };

  useEffect(() => {
    // When a job is expanded, fetch live jobs for that company
    if (expandedJob !== null) {
      const company = formattedJobs[expandedJob]?.company;
      if (company && company !== "Unknown") {
        fetchLiveJobsForCompany(company, expandedJob);
      }
    }
  }, [expandedJob, formattedJobs]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-6"></div>
        <p className="text-lg font-medium text-gray-700">Searching for matching jobs...</p>
        <p className="text-sm text-gray-500 mt-2">Analyzing your resume and finding the best matches</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-red-800 font-medium">Error Finding Jobs</h3>
        </div>
        <p className="text-red-700 ml-11">{error}</p>
      </div>
    );
  }

  if (!formattedJobs || formattedJobs.length === 0) {
    return (
      <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <div className="bg-gray-100 p-3 rounded-full inline-flex mb-4">
          <FaBriefcase className="text-gray-500 text-xl" />
        </div>
        <h3 className="text-gray-800 font-medium text-lg mb-2">No Job Matches Found</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          No matching jobs were found for your resume. Try uploading a different resume with more detailed information about your skills and experience.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="section-title">Matching Job Opportunities</h2>
      <div className="space-y-6">
        {formattedJobs.map((job, index) => (
          <div 
            key={index}
            className="card overflow-hidden slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div 
              className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedJob(expandedJob === index ? null : index)}
            >
              <div className="flex justify-between items-start">
                <div className="flex">
                  <div className="bg-blue-100 p-3 rounded-full mr-4 flex-shrink-0">
                    <FaBriefcase className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-500">{job.title || "Job Position"}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <FaBuilding className="mr-1 text-gray-500" size={14} />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FaMapMarkerAlt className="mr-1 text-gray-500" size={14} />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FaRegClock className="mr-1 text-gray-500" size={14} />
                        <span>{job.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setExpandedJob(expandedJob === index ? null : index)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  {expandedJob === index ? 'Show Less' : 'Show More'}
                  <svg 
                    className={`ml-1 transform transition-transform duration-200 ${expandedJob === index ? 'rotate-180' : ''}`}
                    width="12" 
                    height="6" 
                    viewBox="0 0 12 6" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1 1L6 5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {expandedJob === index && (
              <div className="p-5 bg-gray-50 border-t border-gray-100">
                <div className="mb-5">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Job Description
                  </h4>
                  <p className="text-gray-700 mb-4 whitespace-pre-line">{job.description || "No description available"}</p>
                </div>
                
                <div className="mb-5">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(job.requiredSkills || []).map((skill, skillIndex) => (
                      <div key={skillIndex} className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        <FaCheck className="text-green-500 mr-2" size={12} />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 mb-5">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Live Jobs at {job.company}
                    </h4>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchLiveJobsForCompany(job.company, index);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      disabled={fetchingLiveJobs[index]}
                    >
                      {fetchingLiveJobs[index] ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" size={14} />
                          Loading...
                        </>
                      ) : (
                        <>
                          <FaSync className="mr-2" size={14} />
                          Refresh
                        </>
                      )}
                    </button>
                  </div>

                  {liveJobs[index] ? (
                    liveJobs[index].error ? (
                      <div className="p-4 bg-red-50 rounded-md text-red-600 text-sm">
                        {liveJobs[index].error}
                      </div>
                    ) : liveJobs[index].length > 0 ? (
                      <div className="space-y-3 mt-3">
                        {liveJobs[index].map((liveJob, ljIndex) => (
                          <div key={ljIndex} className="p-3 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-wrap justify-between items-start gap-2">
                              <div>
                                <h5 className="font-medium text-gray-800">{liveJob.title}</h5>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <FaMapMarkerAlt size={12} className="mr-1 text-gray-500" />
                                    {liveJob.location}
                                  </div>
                                  <div className="flex items-center">
                                    <FaRegClock size={12} className="mr-1 text-gray-500" />
                                    {liveJob.type}
                                  </div>
                                  <div className="flex items-center">
                                    <FaRegClock size={12} className="mr-1 text-gray-500" />
                                    Posted {liveJob.posted}
                                  </div>
                                </div>
                              </div>
                              <a
                                href={liveJob.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Apply <FaExternalLinkAlt size={12} className="ml-1" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-blue-50 rounded-md text-blue-700 text-sm">
                        No open positions found at {job.company}.
                      </div>
                    )
                  ) : (
                    <div className="p-4 bg-gray-100 rounded-md text-center text-gray-600 text-sm">
                      Click the refresh button to see live job openings at {job.company}.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 