'use client';

import { useState, useEffect } from 'react';
import { FaSpinner, FaQuestionCircle, FaLightbulb, FaRegCommentDots } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { extractTextFromFile, validateFile } from '../utils/fileUtils';

export default function InterviewQuestions({ resumeText }) {
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [formattedQuestions, setFormattedQuestions] = useState([]);
  const [jdFileName, setJdFileName] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const handleTextAreaChange = (e) => {
    setJobDescription(e.target.value);
  };

  useEffect(() => {
    // Process and normalize questions data from Gemini AI
    if (questions) {
      if (Array.isArray(questions)) {
        // If already an array, use it directly
        setFormattedQuestions(questions);
      } else if (questions.raw) {
        // If we got a raw text response
        console.log("Raw response from API:", questions.raw);
        setFormattedQuestions([{
          question: "Response Processing Error",
          answer: "The AI returned a response in an unexpected format. Please try again with a different job description."
        }]);
      } else {
        // If it's an object but not an array, try to extract questions
        try {
          // Check if there's any array property in the object that might contain questions
          const possibleQuestionsArray = Object.values(questions).find(val => Array.isArray(val));
          if (possibleQuestionsArray) {
            setFormattedQuestions(possibleQuestionsArray);
          } else {
            // Create a single question entry from the object
            setFormattedQuestions([{
              question: questions.question || "Interview Question",
              answer: questions.answer || "No answer available"
            }]);
          }
        } catch (err) {
          console.error("Error formatting questions:", err);
          setFormattedQuestions([{
            question: "Data Processing Error",
            answer: "There was an error processing the interview questions data. Please try again."
          }]);
        }
      }
    } else {
      // No questions data
      setFormattedQuestions([]);
    }
  }, [questions]);

  const onDrop = async (acceptedFiles) => {
    try {
      const file = acceptedFiles[0];
      
      if (!file) {
        throw new Error('No file selected');
      }
      
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      setJdFileName(file.name);
      
      // Extract text from file
      const text = await extractTextFromFile(file);
      setJobDescription(text);
    } catch (err) {
      setError(err.message || 'Failed to process the file');
      console.error('Job description upload error:', err);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  const generateQuestions = async () => {
    if (!resumeText || !jobDescription) {
      setError('Both resume and job description are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'generateQuestions',
          resumeText,
          jobDescription
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate interview questions');
      }

      setQuestions(data.result);
    } catch (err) {
      setError(err.message || 'Failed to generate questions');
      console.error('Error generating questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="slide-up">
      <h2 className="section-title">Generate Interview Questions</h2>
      
      <div className="card p-6 mb-8">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <FaRegCommentDots className="text-purple-600" />
            </div>
            <h3 className="font-medium text-lg">Job Description</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <textarea
                value={jobDescription}
                onChange={handleTextAreaChange}
                className="w-full h-40 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Enter the job description text here to generate relevant interview questions..."
              />
            </div>
            
            <div>
              <div
                {...getRootProps()}
                className={`upload-area h-40 flex items-center justify-center ${isDragActive ? 'upload-area-active' : ''}`}
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <div className="text-gray-400 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-white text-sm">
                    {isDragActive
                      ? "Drop the job description file here"
                      : "Upload a job description file"}
                  </p>
                  {jdFileName && (
                    <p className="mt-2 text-xs font-medium text-green-600">
                      Selected: {jdFileName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={generateQuestions}
            disabled={isLoading || !resumeText || !jobDescription}
            className={isLoading || !resumeText || !jobDescription ? 'opacity-50 cursor-not-allowed btn-primary' : 'btn-primary'}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Generating Questions...
              </>
            ) : (
              <>
                <FaLightbulb className="mr-2" /> 
                Generate Interview Questions
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}
      </div>
      
      {formattedQuestions.length > 0 && (
        <div className="mt-8 slide-up">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <FaQuestionCircle className="text-white mr-3" />
            Interview Questions
            <span className="ml-3 text-sm font-normal bg-purple-100 text-purple-800 py-1 px-2 rounded-full">
              {formattedQuestions.length} questions
            </span>
          </h3>
          
          <div className="space-y-6">
            {formattedQuestions.map((item, index) => (
              <div 
                key={index}
                className="card overflow-hidden transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div 
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-start">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{item.question || "Question not available"}</h4>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 flex items-center font-medium text-sm">
                      {expandedQuestion === index ? 'Hide Answer' : 'Show Answer'}
                      <svg 
                        className={`ml-1 transform transition-transform duration-200 ${expandedQuestion === index ? 'rotate-180' : ''}`}
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
                
                {expandedQuestion === index && (
                  <div className="p-5 bg-gray-50 border-t border-gray-100">
                    <div className="mb-3 flex items-center">
                      <div className="bg-green-100 p-1 rounded-full mr-2">
                        <FaLightbulb className="text-green-600" size={14} />
                      </div>
                      <h5 className="font-medium text-gray-700">Sample Answer:</h5>
                    </div>
                    <p className="text-gray-700 ml-8 whitespace-pre-line">{item.answer || "Answer not available"}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 