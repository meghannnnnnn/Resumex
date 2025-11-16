import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { type, resumeText, jobDescription } = await request.json();
    
    if (!resumeText) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    }

    let prompt = '';
    let result = '';

    switch (type) {
      case 'findJobs':
        // Prompt to find relevant jobs based on resume
        prompt = `Based on the following resume, suggest 10 relevant job positions with job titles, brief descriptions, and required skills that match the candidate's profile. Format your response as JSON with an array of job objects, each with title, description, and requiredSkills properties. Resume: ${resumeText}`;
        break;
      
      case 'generateQuestions':
        if (!jobDescription) {
          return NextResponse.json({ error: 'Job description is required for generating interview questions' }, { status: 400 });
        }
        // Prompt to generate interview questions based on resume and job description
        prompt = `Based on the following resume and job description, generate 10 technical interview questions that are specifically relevant to assess this candidate for this role. For each question, also provide a sample answer. Format your response as JSON with an array of question objects, each with question and answer properties. Resume: ${resumeText} Job Description: ${jobDescription}`;
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const geminiResponse = await model.generateContent(prompt);
    const response = await geminiResponse.response;
    const responseText = response.text();
    
    try {
      // Try to parse the response as JSON
      // Sometimes Gemini returns markdown-formatted JSON, so we need to clean it up
      const cleanedText = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      result = JSON.parse(cleanedText);
      
      // Ensure we always return an array for job matches
      if (type === 'findJobs' && !Array.isArray(result)) {
        // Check if the result has a jobs array property
        if (result.jobs && Array.isArray(result.jobs)) {
          result = result.jobs;
        } else {
          // Convert to an array with this single item
          result = [result];
        }
      }
      
      // Ensure we always return an array for interview questions
      if (type === 'generateQuestions' && !Array.isArray(result)) {
        // Check if the result has a questions array property
        if (result.questions && Array.isArray(result.questions)) {
          result = result.questions;
        } else {
          // Convert to an array with this single item
          result = [result];
        }
      }
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      console.log("Raw response:", responseText);
      
      // If parsing fails, return the raw text
      result = { raw: responseText };
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in Gemini API route:', error);
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
} 