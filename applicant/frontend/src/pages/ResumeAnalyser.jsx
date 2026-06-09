import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

import profileService from '../services/profileService';

const ResumeAnalyser = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [atsScore, setAtsScore] = useState(() => {
    const saved = sessionStorage.getItem('atsScore');
    return saved ? JSON.parse(saved) : null;
  });
  const [atsReport, setAtsReport] = useState(() => {
    const saved = sessionStorage.getItem('atsReport');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [resumeName, setResumeName] = useState('');

  useEffect(() => {
    // Check if the user actually has a resume uploaded in their profile
    const checkResume = async () => {
      try {
        // Use getProfile which is already cached in Redis and guaranteed to exist
        const profile = await profileService.getProfile();
        if (profile && profile.resumeName) {
          setHasResume(true);
          setResumeName(profile.resumeName);
        } else {
          setHasResume(false);
          setAtsScore(null);
          setAtsReport(null);
          sessionStorage.removeItem('atsScore');
          sessionStorage.removeItem('atsReport');
        }
      } catch (error) {
        console.error("Failed to fetch profile info", error);
        setHasResume(false);
      }
    };
    checkResume();
  }, [isAuthenticated, navigate]);

  const handleGetAtsScore = async () => {
    setIsAnalyzing(true);
    try {
      const response = await profileService.getAtsScore(null);
      if (response && response.success) {
        setAtsScore(response.report.overallScore);
        setAtsReport(response.report);
        sessionStorage.setItem('atsScore', JSON.stringify(response.report.overallScore));
        sessionStorage.setItem('atsReport', JSON.stringify(response.report));
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
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        const response = await profileService.uploadResume(file);
        if (response.success || response.message) {
          setHasResume(true);
          setResumeName(file.name);
          setAtsScore(null);
          setAtsReport(null);
          sessionStorage.removeItem('atsScore');
          sessionStorage.removeItem('atsReport');
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
    <div className="container px-1 py-4 lg:py-10">
      <div className="max-w-6xl mx-auto">
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
              <div className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 border-b border-slate-100 pb-8">
                  <div className="max-w-2xl">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Your Resume is Ready</h3>
                    <p className="text-slate-600">
                      We've found your uploaded resume. Click the button below to analyze it against our AI-powered ATS system to discover your score.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-100 py-3 px-5 rounded-xl shrink-0 shadow-sm relative group">
                    <div className="bg-blue-100 p-2 rounded-lg relative z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex flex-col relative z-10">
                      <span className="font-semibold text-slate-700 text-sm max-w-[280px] truncate" title={resumeName || 'resume.pdf'}>
                        {resumeName || 'resume.pdf'}
                      </span>
                      <span className="text-xs text-blue-600 font-medium mt-0.5"> Your Resume</span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full">
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
                        <div className="mt-8 space-y-6">
                          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
                              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                </svg>
                                Score Breakdown
                              </h4>
                            </div>
                            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                              <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Completeness</div>
                                <div className="text-lg font-bold text-slate-800">{atsReport.breakdown.completeness}<span className="text-sm text-slate-400 font-medium">/20</span></div>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Formatting</div>
                                <div className="text-lg font-bold text-slate-800">{atsReport.breakdown.formatting}<span className="text-sm text-slate-400 font-medium">/15</span></div>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Keyword Match</div>
                                <div className="text-lg font-bold text-slate-800">{atsReport.breakdown.keywordCoverage}<span className="text-sm text-slate-400 font-medium">/25</span></div>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Experience</div>
                                <div className="text-lg font-bold text-slate-800">{atsReport.breakdown.experienceQuality}<span className="text-sm text-slate-400 font-medium">/15</span></div>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Projects</div>
                                <div className="text-lg font-bold text-slate-800">{atsReport.breakdown.projectQuality}<span className="text-sm text-slate-400 font-medium">/15</span></div>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Grammar</div>
                                <div className="text-lg font-bold text-slate-800">{atsReport.breakdown.grammar}<span className="text-sm text-slate-400 font-medium">/10</span></div>
                              </div>
                            </div>
                          </div>
                          
                          {atsReport.recommendations && atsReport.recommendations.length > 0 && (
                            <div className="bg-amber-50/50 rounded-xl border border-amber-200 overflow-hidden">
                              <div className="bg-amber-100/50 border-b border-amber-200 px-5 py-3">
                                <h4 className="font-bold text-amber-800 flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                  Top Recommendations
                                </h4>
                              </div>
                              <div className="p-5">
                                <ul className="space-y-3">
                                  {atsReport.recommendations.map((rec, i) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-700">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="leading-relaxed">{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={handleGetAtsScore}
                      disabled={isAnalyzing}
                      className="flex-1 bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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

                    <button 
                      onClick={() => navigate('/jobs')}
                      className="flex-1 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-bold py-4 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Recommended Jobs
                    </button>
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
