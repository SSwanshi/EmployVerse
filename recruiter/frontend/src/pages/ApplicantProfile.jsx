import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getStoredToken } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, User, Mail, Phone, GraduationCap, Briefcase, Code, Globe, Github, Linkedin, Trophy, FileText, Lock } from 'lucide-react';
import defaultImage from '../assets/images/default.png';

const ApplicantProfile = () => {
  const { applicantId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && !user.isPremium) {
      navigate('/upgrade', { replace: true });
    }
  }, [user, navigate]);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  const fetchApplicantDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = getStoredToken();
      
      const response = await fetch(`${API_BASE}/api/applicant/details/${applicantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setApplicant(data.applicant);
      } else {
        setError(data.message || 'Failed to fetch applicant details');
      }
    } catch (err) {
      console.error('Error fetching applicant details:', err);
      setError(`Something went wrong while loading applicant profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [applicantId, API_BASE]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (applicantId) {
      fetchApplicantDetails();
    }
  }, [applicantId, fetchApplicantDetails]);

  const getApplicantImageUrl = () => {
    if (applicant?.hasProfileImage) {
      const token = getStoredToken();
      return `${API_BASE}/api/applicant/image/${applicant.userId || applicantId}?token=${encodeURIComponent(token)}`;
    }
    return defaultImage;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGenderDisplay = (gender) => {
    if (!gender) return 'Not specified';
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  // Parse skills string into array (comma or newline separated)
  const parseSkills = (skills) => {
    if (!skills) return [];
    return skills.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-lg">Loading applicant profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <button onClick={() => navigate(-1)} className="inline-flex items-center text-black hover:text-black font-medium">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </button>
          </div>
          <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded">{error}</div>
        </div>
      </div>
    );
  }

  if (!applicant && !loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <button onClick={() => navigate(-1)} className="inline-flex items-center text-black hover:text-black font-medium">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </button>
          </div>
          <div className="bg-gray-100 border border-black text-black px-4 py-3 rounded">
            No applicant data found.
          </div>
        </div>
      </div>
    );
  }

  const skillsList = parseSkills(applicant.skills);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-black hover:text-black font-medium mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Applications
          </button>
          <h1 className="text-3xl font-bold text-black">Applicant Profile</h1>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className=" bg-black text-white  h-32"></div>
          <div className="px-6 pb-6 -mt-16">
            <div className="flex flex-col md:flex-row md:items-end md:gap-6">
              <div className="flex justify-center md:justify-start">
                <img
                  src={getApplicantImageUrl()}
                  alt={`${applicant.firstName} ${applicant.lastName}`}
                  className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
                  onError={(e) => { e.target.src = defaultImage; }}
                />
              </div>
              <div className="text-center md:text-left mt-4 md:mt-0 flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {applicant.firstName} {applicant.lastName}
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <a href={`mailto:${applicant.email}`} className="text-black hover:underline">{applicant.email}</a>
                  </div>
                  {applicant.phone && (
                    <div className="flex items-center justify-center md:justify-start text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <a href={`tel:${applicant.phone}`} className="text-black hover:underline">{applicant.phone}</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-black mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" /> Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
              <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-md">{getGenderDisplay(applicant.gender)}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Member Since</label>
              <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-md">{formatDate(applicant.memberSince)}</p>
            </div>
            {applicant.collegeName && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <GraduationCap className="h-4 w-4 inline mr-1" /> College
                </label>
                <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-md">{applicant.collegeName}</p>
              </div>
            )}
          </div>
        </div>

        {/* About */}
        {applicant.about && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-black mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" /> About
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{applicant.about}</p>
          </div>
        )}

        {/* Skills */}
        {skillsList.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-black mb-4 flex items-center">
              <Code className="h-5 w-5 mr-2" /> Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, index) => (
                <span key={index} className="bg-gray-100 text-black px-3 py-1 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {applicant.workExperience && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-black mb-4 flex items-center">
              <Briefcase className="h-5 w-5 mr-2" /> Work Experience
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{applicant.workExperience}</p>
          </div>
        )}

        {/* Achievements */}
        {applicant.achievements && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-black mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2" /> Achievements
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{applicant.achievements}</p>
          </div>
        )}

        {/* Social / Portfolio Links */}
        {(applicant.linkedinProfile || applicant.githubProfile || applicant.portfolioWebsite) && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-black mb-4 flex items-center">
              <Globe className="h-5 w-5 mr-2" /> Links
            </h3>
            <div className="space-y-3">
              {applicant.linkedinProfile && (
                <a href={applicant.linkedinProfile} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-black hover:underline">
                  <Linkedin className="h-5 w-5" /> {applicant.linkedinProfile}
                </a>
              )}
              {applicant.githubProfile && (
                <a href={applicant.githubProfile} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-800 hover:underline">
                  <Github className="h-5 w-5" /> {applicant.githubProfile}
                </a>
              )}
              {applicant.portfolioWebsite && (
                <a href={applicant.portfolioWebsite} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-700 hover:underline">
                  <Globe className="h-5 w-5" /> {applicant.portfolioWebsite}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Resume */}
        {applicant.hasResume && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-black mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" /> Resume
            </h3>
            <a
              href={`${API_BASE}/api/applicant/resume/${applicant.userId || applicantId}?token=${encodeURIComponent(getStoredToken())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-black transition-colors font-medium"
            >
              <FileText className="h-4 w-4" />
              View Resume
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantProfile;