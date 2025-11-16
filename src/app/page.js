'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ResumeUploader from '../components/ResumeUploader';
import JobMatches from '../components/JobMatches';
import InterviewQuestions from '../components/InterviewQuestions';
import { FaBriefcase, FaQuestionCircle, FaRocket, FaFileAlt, FaBrain } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedGradientBackground } from '@/components/ui/animated-gradient-background';
import { GlowCard } from '@/components/ui/glow-card';

export default function Home() {
  const [resumeText, setResumeText] = useState('');
  const [jobs, setJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('jobs');

  const handleResumeProcessed = async (text) => {
    setResumeText(text);
    await findMatchingJobs(text);
  };

  const findMatchingJobs = async (text) => {
    setIsLoadingJobs(true);
    setError('');

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'findJobs',
          resumeText: text
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find matching jobs');
      }

      setJobs(data.result);
    } catch (err) {
      setError(err.message || 'Failed to process request');
      console.error('Error finding jobs:', err);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <AnimatedGradientBackground className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <motion.div 
            className="flex items-center justify-between"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <FaRocket className="text-primary text-3xl" />
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                  ResumeX
                </h1>
                <p className="text-sm text-muted-foreground">AI-Powered Resume Assistant</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a 
                href="https://ai.google.dev/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <FaBrain className="text-lg" />
                
              </a>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {!resumeText ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            <Card className="overflow-hidden backdrop-blur-xl bg-background/90 border-border/50 shadow-xl">
              <CardHeader className="text-center py-10 px-6 bg-gradient-to-b from-background to-secondary">
                <CardTitle className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                  Supercharge Your Job Search
                </CardTitle>
                <CardDescription className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Upload your resume and let our AI find matching jobs and prepare you for interviews
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-8">
                <motion.div
                  variants={containerVariants}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
                >
                  {[
                    {
                      icon: <FaFileAlt className="text-blue-600 text-2xl" />,
                      title: "Resume Analysis",
                      description: "Upload your resume and get AI-powered insights",
                      bgColor: "bg-blue-50",
                      borderColor: "border-blue-200"
                    },
                    {
                      icon: <FaBriefcase className="text-purple-600 text-2xl" />,
                      title: "Job Matching",
                      description: "Find jobs that match your skills and experience",
                      bgColor: "bg-purple-50",
                      borderColor: "border-purple-200"
                    },
                    {
                      icon: <FaBrain className="text-orange-600 text-2xl" />,
                      title: "Interview Prep",
                      description: "Generate custom interview questions and answers",
                      bgColor: "bg-orange-50",
                      borderColor: "border-orange-200"
                    }
                  ].map((feature, index) => (
                    <motion.div key={index} variants={itemVariants}>
                      <GlowCard className="h-full transform hover:scale-[1.02] transition-transform duration-300">
                        <div className="p-8 flex flex-col items-center text-center h-full">
                          <div className={`${feature.bgColor} p-4 rounded-2xl mb-6 border ${feature.borderColor}`}>
                            {feature.icon}
                          </div>
                          <h3 className="font-semibold text-xl mb-3">{feature.title}</h3>
                          <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                      </GlowCard>
                    </motion.div>
                  ))}
                </motion.div>
                
                <ResumeUploader onResumeProcessed={handleResumeProcessed} />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="backdrop-blur-xl bg-background/90 border-border/50 shadow-xl">
              <CardContent className="p-8">
                <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl flex items-center">
                  <div className="bg-green-100 p-3 rounded-xl mr-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-grow">
                    <p className="text-green-800 font-semibold text-lg mb-1">Resume successfully processed!</p>
                    <p className="text-green-700">You can now explore job matches or generate interview questions.</p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setResumeText('')}
                    className="ml-6 border-green-200 text-green-700 hover:bg-green-50"
                  >
                    Upload New Resume
                  </Button>
                </div>

                <Tabs defaultValue="jobs" onValueChange={setActiveTab} value={activeTab} className="w-full">
                  <TabsList className="w-full p-1 bg-secondary rounded-xl mb-8">
                    <TabsTrigger value="jobs" className="flex-1 py-3 rounded-lg">
                      <FaBriefcase className="mr-3 text-lg" />
                      Find Matching Jobs
                    </TabsTrigger>
                    <TabsTrigger value="interview" className="flex-1 py-3 rounded-lg">
                      <FaQuestionCircle className="mr-3 text-lg" />
                      Interview Questions
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="jobs" className="mt-4 focus-visible:outline-none">
                    <JobMatches jobs={jobs} isLoading={isLoadingJobs} error={error} />
                  </TabsContent>
                  
                  <TabsContent value="interview" className="mt-4 focus-visible:outline-none">
                    <InterviewQuestions resumeText={resumeText} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      <footer className="bg-background/80 backdrop-blur-xl border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <FaRocket className="text-primary text-2xl" />
              <span className="font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                ResumeX
              </span>
            </div>
            <p className="text-muted-foreground">
              &copy; {new Date().getFullYear()} ResumeX
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-muted hover:text-primary transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-muted hover:text-primary transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </AnimatedGradientBackground>
  );
}
