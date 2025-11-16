# ResumeX

ResumeX is an AI-powered resume analysis tool that helps job seekers find relevant job opportunities and prepare for interviews using Google's Gemini AI.

## Features

- **Resume Analysis**: Upload your resume to get insights and job matches based on your skills and experience.
- **Job Matching**: Gemini AI analyzes your resume and suggests relevant job opportunities that match your profile.
- **Interview Question Generator**: Generate customized interview questions based on your resume and a job description to help you prepare for interviews.

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- Google Gemini API key (get one at [Google AI Studio](https://ai.google.dev/))

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the application.

## Usage

1. **Upload Resume**: Drag and drop your resume (PDF or TXT format) or click to upload.
2. **Find Job Matches**: After uploading your resume, the system will automatically find and display relevant job opportunities.
3. **Generate Interview Questions**: Navigate to the Interview Questions tab, enter or upload a job description, and generate customized interview questions to help you prepare.

## Technologies Used

- Next.js
- React
- Google Gemin AI
- Tailwind CSS
- React Dropzone
  
## Demo Vedio
  
https://github.com/user-attachments/assets/41783d44-2115-4a79-a54e-e94c2b95816e

## Note

This application processes resume data and job descriptions locally in your browser. No data is stored on external servers except when making API calls to Google Gemini.

## License

This project is open source and available under the MIT License.
