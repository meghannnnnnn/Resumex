import { NextResponse } from 'next/server';
import axios from 'axios';

// Real API to fetch jobs by company name
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');

    if (!company) {
      return NextResponse.json(
        { error: 'Company parameter is required' },
        { status: 400 }
      );
    }

    // Fetch real jobs from external API
    const jobs = await fetchRealJobsForCompany(company);

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching live jobs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// Fetch real jobs for a given company using external API
async function fetchRealJobsForCompany(company) {
  try {
    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params: {
        query: `${company} jobs in India`,
        page: '1',
        num_pages: '1',
        country: 'IN' // Filter for India
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPID_API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    
    if (response.data && response.data.data) {
      // Filter results for jobs located in India

      return filteredJobs.map(job => ({
        id: job.job_id || `job-${Math.random().toString(36).substr(2, 9)}`,
        title: job.job_title || 'Position Available',
        company: job.employer_name || company,
        location: job.job_city
          ? `${job.job_city}, ${job.job_state || ''}`
          : 'India',
        type: job.job_employment_type || 'Not specified',
        url:
          job.job_apply_link ||
          job.job_google_link ||
          `https://www.google.com/search?q=${encodeURIComponent(`${company} jobs in India`)}`,
        posted: job.job_posted_at_datetime_utc
          ? formatPostedDate(job.job_posted_at_datetime_utc)
          : 'Recently posted'
      }));
    }

    // Fallback to mock jobs if no results
    console.log('No results from API, using fallback data');
    return getMockJobsForCompany(company);
  } catch (error) {
    console.error('Error with external API:', error);
    return getMockJobsForCompany(company);
  }
}

// Format the posted date to a readable format
function formatPostedDate(dateString) {
  try {
    const postedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - postedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays} days ago`;
    }
  } catch (e) {
    return 'Recently posted';
  }
}

// Generate mock jobs for a given company (fallback)
function getMockJobsForCompany(company) {
  const standardPositions = [
    'Software Engineer',
    'Data Analyst',
    'Product Manager',
    'UX Designer',
    'Marketing Specialist',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'QA Engineer'
  ];

  const count = Math.floor(Math.random() * 3) + 3; // 3 to 5 jobs
  const jobs = [];

  for (let i = 0; i < count; i++) {
    const positionIndex = Math.floor(Math.random() * standardPositions.length);
    const position = standardPositions[positionIndex];

    jobs.push({
      id: `job-${i + 1}`,
      title: position,
      company: company,
      location: getRandomLocation(),
      type: getRandomJobType(),
      url: `https://example.com/jobs/${company
        .toLowerCase()
        .replace(/\s+/g, '-')}/${position.toLowerCase().replace(/\s+/g, '-')}`,
      posted: getRandomPostedDate()
    });
  }

  return jobs;
}

// Helper functions for generating random job attributes (for fallback)
function getRandomLocation() {
  const locations = [
    'Mumbai, India',
    'Bangalore, India',
    'Delhi, India',
    'Hyderabad, India',
    'Chennai, India',
    'Pune, India',
    'Ahmedabad, India',
    'Kolkata, India',
    'Remote (India)'
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

function getRandomJobType() {
  const types = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'];
  return types[Math.floor(Math.random() * types.length)];
}

function getRandomPostedDate() {
  const days = Math.floor(Math.random() * 30) + 1;
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
