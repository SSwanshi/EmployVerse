import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

import profileService from '../services/profileService';

const ResumeAnalyser = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [atsScore, setAtsScore] = useState(null);
  const [atsReport, setAtsReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [resumeName, setResumeName] = useState('');

  useEffect(() => {
    // Check if the user actually has a resume uploaded in their profile
    const checkResume = async () => {
      if (isAuthenticated) {
        try {
          // Use getProfile which is already cached in Redis and guaranteed to exist
          const profile = await profileService.getProfile();
          if (profile && profile.resumeName) {
            setHasResume(true);
            setResumeName(profile.resumeName);
          } else {
            setHasResume(false);
          }
        } catch (error) {
          console.error("Failed to fetch profile info", error);
          setHasResume(false);
        }
      } else {
        setHasResume(false);
      }
    };
    checkResume();
  }, [isAuthenticated]);

  const handleGetAtsScore = async () => {
    setIsAnalyzing(true);
    try {
      const response = await profileService.getAtsScore(null);
      if (response && response.success) {
        setAtsScore(response.report.overallScore);
        setAtsReport(response.report);
      } else {
        alert(response.message || 'Failed to analyze resume');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during ATS analysis. Make sure GEMINI_API_KEY is configured on the backend.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        const response = await profileService.uploadResume(file);
        if (response.success || response.message) {
          setHasResume(true);
          setResumeName(file.name);
        }
      } catch (error) {
        console.error("Upload error", error);
        alert("Failed to upload resume");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 lg:py-20 mt-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Resume Analyser</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Get instant feedback on your resume and see how well it matches top industry standards with our AI-powered ATS scoring system.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-12">
            {!hasResume ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Resume Found</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                  Please upload your resume to get your ATS score and personalized feedback.
                </p>
                <div className="relative inline-block">
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    disabled={isUploading}
                    title="Upload Resume"
                  />
                  <button 
                    disabled={isUploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-70 flex items-center justify-center gap-2 min-w-[200px] mx-auto relative z-0"
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      'Upload Resume'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Your Resume is Ready</h3>
                  <p className="text-slate-600 mb-8">
                    We've found your uploaded resume. Click the button below to analyze it against our AI-powered ATS system to discover your score.
                  </p>
                  
                  {atsScore !== null ? (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-600 font-semibold">ATS Compatibility Score</span>
                        <span className={`text-2xl font-black ${atsScore >= 80 ? 'text-green-500' : atsScore >= 65 ? 'text-amber-500' : 'text-red-500'}`}>
                          {atsScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
                        <div 
                          className={`h-3 rounded-full ${atsScore >= 80 ? 'bg-green-500' : atsScore >= 65 ? 'bg-amber-500' : 'bg-red-500'}`} 
                          style={{ width: `${atsScore}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-slate-500 mb-4">
                        {atsScore >= 80 ? 'Great job! Your resume is highly compatible with ATS systems.' : 
                         atsScore >= 65 ? 'Good start, but there is room for optimization to improve visibility.' : 
                         'Your resume might be getting filtered out. Consider reformatting.'}
                      </p>
                      
                      {atsReport && (
                        <div className="mt-6 border-t border-slate-200 pt-4">
                          <h4 className="font-semibold text-slate-800 mb-2">Score Breakdown</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                            <div>Completeness: {atsReport.breakdown.completeness}/20</div>
                            <div>Formatting: {atsReport.breakdown.formatting}/15</div>
                            <div>Keyword Match: {atsReport.breakdown.keywordCoverage}/25</div>
                            <div>Experience: {atsReport.breakdown.experienceQuality}/15</div>
                            <div>Projects: {atsReport.breakdown.projectQuality}/15</div>
                            <div>Grammar: {atsReport.breakdown.grammar}/10</div>
                          </div>
                          
                          {atsReport.recommendations && atsReport.recommendations.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-semibold text-slate-800 mb-2">Top Recommendations</h4>
                              <ul className="list-disc pl-5 text-sm text-slate-600">
                                {atsReport.recommendations.map((rec, i) => (
                                  <li key={i}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}

                  <button 
                    onClick={handleGetAtsScore}
                    disabled={isAnalyzing}
                    className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Get ATS Score
                      </>
                    )}
                  </button>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-500 rounded-2xl transform rotate-3 scale-105 opacity-10 group-hover:rotate-6 transition-transform duration-300"></div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative z-10 flex flex-col items-center justify-center min-h-[300px]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-100 mb-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-slate-700 text-center px-4 break-words max-w-full">{resumeName || 'resume.pdf'}</span>
                    <span className="text-xs text-slate-400 mt-1">Ready for analysis</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyser;
