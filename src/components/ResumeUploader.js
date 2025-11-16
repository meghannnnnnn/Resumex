'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FaFileUpload, FaSpinner, FaFile, FaCheck } from 'react-icons/fa';
import { extractTextFromFile, validateFile } from '../utils/fileUtils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ResumeUploader({ onResumeProcessed }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    // Reset states
    setError('');
    setIsLoading(true);
    
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
      
      setFileName(file.name);
      
      // Extract text from file
      const text = await extractTextFromFile(file);
      
      // Call the parent's callback with the extracted text
      onResumeProcessed(text);
    } catch (err) {
      setError(err.message || 'Failed to process the file');
      console.error('Resume upload error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onResumeProcessed]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="fade-in"
    >
      <h2 className="text-2xl font-bold text-center mb-6">Upload Your Resume</h2>
      
      <div
        {...getRootProps()}
        className={`relative group overflow-hidden border-2 border-dashed rounded-xl p-10 transition-all duration-300 ${
          isDragActive 
            ? 'border-primary/70 bg-primary/5' 
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}
      >
        <input {...getInputProps()} />
        
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          {isLoading ? (
            <div className="py-12">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-t-2 border-primary animate-spin"></div>
                <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                  <FaFileUpload className="text-primary text-xl" />
                </div>
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-medium text-foreground"
              >
                Processing your resume...
              </motion.p>
              <p className="text-sm text-muted-foreground mt-2">This will only take a moment</p>
            </div>
          ) : (
            <>
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="bg-primary/10 p-5 rounded-full mb-6"
              >
                <FaFileUpload className="text-primary text-5xl" />
              </motion.div>
              
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                {isDragActive
                  ? "Drop your resume here"
                  : "Drag & drop your resume here"}
              </h3>
              
              <p className="text-muted-foreground mb-4">
                or <Button variant="link" className="px-1 py-0">browse files</Button> from your computer
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <div className="flex items-center px-3 py-1 bg-muted rounded-full">
                  <span className="text-xs text-muted-foreground">PDF</span>
                </div>
                <div className="flex items-center px-3 py-1 bg-muted rounded-full">
                  <span className="text-xs text-muted-foreground">TXT</span>
                </div>
                <div className="flex items-center px-3 py-1 bg-muted rounded-full">
                  <span className="text-xs text-muted-foreground">Max 5MB</span>
                </div>
              </div>
              
              {fileName && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center w-full max-w-md"
                >
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <FaCheck className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">{fileName}</p>
                    <p className="text-xs text-green-600">Ready for processing</p>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center"
        >
          <div className="bg-destructive/20 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm font-medium text-destructive">{error}</p>
        </motion.div>
      )}
    </motion.div>
  );
} 