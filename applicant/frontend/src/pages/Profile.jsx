import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import profileService from "../services/profileService";
import { useToast } from "../contexts/ToastContext";
import ProfileSkeleton from "./ProfileSkeleton";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [resumeName, setResumeName] = useState(null);
  const [applicationHistory, setApplicationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const { showToast } = useToast();
  
  // Additional profile fields
  const [additionalInfo, setAdditionalInfo] = useState({
    collegeName: '',
    skills: '',
    about: '',
    linkedinProfile: '',
    githubProfile: '',
    portfolioWebsite: '',
    workExperience: '',
    achievements: ''
  });
  const [isEditingField, setIsEditingField] = useState({
    collegeName: false,
    skills: false,
    about: false,
    linkedinProfile: false,
    githubProfile: false,
    portfolioWebsite: false,
    workExperience: false,
    achievements: false
  });
  const [tempValues, setTempValues] = useState({
    collegeName: '',
    skills: '',
    about: '',
    linkedinProfile: '',
    githubProfile: '',
    portfolioWebsite: '',
    workExperience: '',
    achievements: ''
  });

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setUserData(data.user);
      setResumeName(data.resumeName);
      setApplicationHistory(data.applicationHistory || []);
      
      // Load additional info
      const addInfo = {
        collegeName: data.user?.collegeName || '',
        skills: data.user?.skills || '',
        about: data.user?.about || '',
        linkedinProfile: data.user?.linkedinProfile || '',
        githubProfile: data.user?.githubProfile || '',
        portfolioWebsite: data.user?.portfolioWebsite || '',
        workExperience: data.user?.workExperience || '',
        achievements: data.user?.achievements || ''
      };
      setAdditionalInfo(addInfo);
      setTempValues(addInfo);
      
      // Fetch profile image if it exists
      if (data.user?.profileImageId) {
        try {
          const imageBlob = await profileService.getProfileImage();
          const imageUrl = URL.createObjectURL(imageBlob);
          setProfileImageUrl(imageUrl);
        } catch (error) {
          console.error('Error fetching profile image:', error);
          setProfileImageUrl(null);
        }
      } else {
        setProfileImageUrl(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to load profile data', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, []); // Remove showToast dependency to prevent unnecessary re-renders

  useEffect(() => {
    fetchProfileData();
    
    // Cleanup function to revoke object URLs
    return () => {
      if (profileImageUrl) {
        URL.revokeObjectURL(profileImageUrl);
      }
    };
  }, []); // Only run once on mount

  const handleProfileImageUpload = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('profileImageInput');
    
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      showToast('Please select an image', 'error');
      return;
    }

    const file = fileInput.files[0];

    if (!file) {
      showToast('Please select an image', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('Only image files are allowed', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size must be less than 2MB', 'error');
      return;
    }

    try {
      const data = await profileService.uploadProfileImage(file);
      showToast(data.message || 'Profile image uploaded successfully!', 'success');
      
      // Refresh profile data to get updated profileImageId
      await fetchProfileData();
      setImageTimestamp(Date.now());
      fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Upload failed';
      showToast(errorMessage, 'error');
    }
  };

  const handleDeleteProfileImage = async () => {
    if (!window.confirm('Are you sure you want to delete your profile image?')) {
      return;
    }

    try {
      await profileService.deleteProfileImage();
      showToast('Profile image deleted successfully!', 'success');
      
      // Revoke old URL
      if (profileImageUrl) {
        URL.revokeObjectURL(profileImageUrl);
      }
      
      // Update state
      setUserData((prev) => ({ ...prev, profileImageId: null }));
      setProfileImageUrl(null);
      setImageTimestamp(Date.now());
    } catch {
      showToast('Failed to delete image', 'error');
    }
  };

  const handleViewResume = async () => {
    try {
      const resumeBlob = await profileService.getResume();
      const resumeUrl = URL.createObjectURL(resumeBlob);
      window.open(resumeUrl, '_blank');
      
      // Clean up the object URL after a short delay
      setTimeout(() => URL.revokeObjectURL(resumeUrl), 1000);
    } catch (error) {
      console.error('Error viewing resume:', error);
      showToast('Failed to load resume', 'error');
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('resumeFile');
    const file = fileInput.files[0];

    if (!file) {
      showToast('Please select a file', 'error');
      return;
    }

    if (file.type !== 'application/pdf') {
      showToast('Only PDF files are allowed', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }

    try {
      const data = await profileService.uploadResume(file);
      showToast(data.message || 'Resume uploaded successfully!', 'success');
      setResumeName(file.name);
    } catch (error) {
      showToast(error.response?.data?.message || 'Upload failed', 'error');
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) {
      return;
    }

    try {
      const data = await profileService.deleteResume();
      showToast(data.message || 'Resume deleted successfully!', 'success');
      setResumeName(null);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete resume', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      await profileService.deleteAccount();
      showToast('Account deleted successfully', 'success');
      setTimeout(() => {
        window.location.href = '/?success=Account+deleted+successfully';
      }, 1500);
    } catch {
      showToast('Failed to delete account', 'error');
    }
  };

  const handleEditField = (fieldName) => {
    setIsEditingField(prev => ({ ...prev, [fieldName]: true }));
    setTempValues(prev => ({ ...prev, [fieldName]: additionalInfo[fieldName] }));
  };

  const handleCancelEdit = (fieldName) => {
    setIsEditingField(prev => ({ ...prev, [fieldName]: false }));
    setTempValues(prev => ({ ...prev, [fieldName]: additionalInfo[fieldName] }));
  };

  const handleSaveField = async (fieldName) => {
    // Validate URL fields
    const urlFields = ['linkedinProfile', 'githubProfile', 'portfolioWebsite'];
    if (urlFields.includes(fieldName) && tempValues[fieldName]) {
      const urlValue = tempValues[fieldName].trim();
      
      // Check if it's a valid URL
      if (!urlValue.startsWith('http://') && !urlValue.startsWith('https://')) {
        showToast('Please enter a valid URL starting with http:// or https://', 'error');
        return;
      }

      // Additional URL format validation
      try {
        new URL(urlValue);
      } catch {
        showToast('Please enter a valid URL format', 'error');
        return;
      }

      // Specific domain validation for LinkedIn
      if (fieldName === 'linkedinProfile' && !urlValue.includes('linkedin.com')) {
        showToast('Please enter a valid LinkedIn URL (must contain linkedin.com)', 'error');
        return;
      }

      // Specific domain validation for GitHub
      if (fieldName === 'githubProfile' && !urlValue.includes('github.com')) {
        showToast('Please enter a valid GitHub URL (must contain github.com)', 'error');
        return;
      }
    }

    try {
      const updateData = {
        ...userData,
        [fieldName]: tempValues[fieldName]
      };
      
      await profileService.updateProfile(updateData);
      
      setAdditionalInfo(prev => ({ ...prev, [fieldName]: tempValues[fieldName] }));
      setIsEditingField(prev => ({ ...prev, [fieldName]: false }));
      showToast(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} updated successfully`, 'success');
    } catch (error) {
      showToast(`Failed to update ${fieldName}`, 'error');
      console.error('Update error:', error);
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setTempValues(prev => ({ ...prev, [fieldName]: value }));
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-150/60 p-6">
              <div className="flex flex-col items-center">
                {/* Profile Image */}
                <div className="relative mb-6">
                  {/* Premium Crown Icon */}
                  {userData.isPremium && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="relative group">
                        <div className="bg-slate-900 text-white rounded-full p-1.5 shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L15 8.5L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L9 8.5L12 2Z" />
                          </svg>
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
                          Premium Member
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {profileImageUrl ? (
                    <img
                      key={imageTimestamp}
                      src={profileImageUrl}
                      className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
                      alt="Profile"
                      onError={(e) => {
                        console.error('Failed to load profile image');
                        const placeholder = e.target.nextElementSibling;
                        if (placeholder) {
                          e.target.style.display = 'none';
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-32 h-32 flex items-center justify-center rounded-full border-4 border-white shadow-md bg-slate-100 text-slate-800 text-4xl font-extrabold ${profileImageUrl ? 'hidden' : ''}`}
                  >
                    {userData.firstName?.charAt(0).toUpperCase()}
                  </div>
                </div>

                <h2 className="text-lg font-black text-slate-900 text-center leading-snug">
                  {userData.firstName} {userData.lastName}
                </h2>
                <p className="text-slate-500 text-xs font-semibold mb-6">{userData.email}</p>

                {/* Image Upload Form */}
                <form onSubmit={handleProfileImageUpload} className="w-full">
                  <div className="mb-3">
                    <label 
                      htmlFor="profileImageInput"
                      className="flex flex-col items-center justify-center w-full h-10 border border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-all duration-200"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <i className="fas fa-camera text-slate-400 text-xs"></i>
                        <p className="text-[11px] font-bold text-slate-650">Change Photo</p>
                      </div>
                      <input
                        type="file"
                        id="profileImageInput"
                        name="profileImage"
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 px-3 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <i className="fas fa-upload text-[10px]"></i> Upload
                    </button>
                    {userData.profileImageId && (
                      <button
                        type="button"
                        onClick={handleDeleteProfileImage}
                        className="px-3 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-100 transition duration-200 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <i className="fas fa-trash text-[10px]"></i> Del
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-150/60 p-6">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  to="/profile/edit"
                  className="flex items-center p-3 bg-slate-50 text-slate-800 rounded-xl hover:bg-slate-100/80 transition duration-200 font-bold text-xs group"
                >
                  <i className="fas fa-edit mr-2.5 text-slate-500"></i>
                  <span>Edit Profile</span>
                  <i className="fas fa-chevron-right ml-auto text-slate-400 group-hover:text-slate-650 transition-colors"></i>
                </Link>
                <Link
                  to="/jobs"
                  className="flex items-center p-3 bg-slate-50 text-slate-800 rounded-xl hover:bg-slate-100/80 transition duration-200 font-bold text-xs group"
                >
                  <i className="fas fa-briefcase mr-2.5 text-slate-500"></i>
                  <span>Browse Jobs</span>
                  <i className="fas fa-chevron-right ml-auto text-slate-400 group-hover:text-slate-650 transition-colors"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-150/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50">
                <h2 className="text-md font-extrabold text-slate-900 tracking-tight flex items-center">
                  <i className="fas fa-user-circle mr-2 text-slate-500"></i> Profile Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ProfileInfoCard icon="fa-user" label="First Name" value={userData.firstName} />
                  <ProfileInfoCard icon="fa-user" label="Last Name" value={userData.lastName} />
                  <ProfileInfoCard icon="fa-envelope" label="Email Address" value={userData.email} />
                  <ProfileInfoCard icon="fa-phone" label="Phone Number" value={userData.phone} />
                  <ProfileInfoCard icon="fa-venus-mars" label="Gender" value={userData.gender} />
                  <ProfileInfoCard icon="fa-calendar-alt" label="Member Since" value={userData.memberSince ? new Date(userData.memberSince).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'} />
                </div>
              </div>
            </div>

            {/* Resume Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-150/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50">
                <h2 className="text-md font-extrabold text-slate-900 tracking-tight flex items-center">
                  <i className="fas fa-file-alt mr-2 text-slate-500"></i> Resume Section
                </h2>
              </div>
              <div className="p-6">
                {resumeName ? (
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                    <div className="mb-4 md:mb-0">
                      <p className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider mb-1">
                        <i className="fas fa-file-pdf text-red-500 mr-1.5"></i> Uploaded Resume
                      </p>
                      <p className="text-sm font-extrabold text-slate-900">{resumeName}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleViewResume}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition duration-200 cursor-pointer flex items-center"
                      >
                        <i className="fas fa-eye mr-1.5 text-[10px]"></i> View
                      </button>
                      <button
                        onClick={handleDeleteResume}
                        className="px-3.5 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-100 transition duration-200 cursor-pointer flex items-center"
                      >
                        <i className="fas fa-trash mr-1.5 text-[10px]"></i> Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleResumeUpload}>
                    <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 transition duration-200">
                      <i className="fas fa-file-upload text-slate-400 text-3xl mb-3"></i>
                      <h3 className="text-sm font-bold text-slate-800 mb-1">Upload Your Resume</h3>
                      <p className="text-xs text-slate-500 mb-4 font-semibold">Drag & drop your resume here or click to browse</p>
                      <label className="block mb-4">
                        <span className="sr-only">Choose resume file</span>
                        <input
                          type="file"
                          id="resumeFile"
                          name="resume"
                          accept=".pdf"
                          required
                          className="block w-full text-xs text-slate-500 mx-auto
                            file:mr-4 file:py-1.5 file:px-3
                            file:rounded-xl file:border-0
                            file:text-[11px] file:font-bold
                            file:bg-slate-900 file:text-white
                            hover:file:bg-black file:cursor-pointer"
                        />
                      </label>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition duration-200 cursor-pointer flex items-center mx-auto"
                      >
                        <i className="fas fa-cloud-upload-alt mr-1.5"></i> Upload Resume
                      </button>
                      <p className="text-[10px] text-slate-400 font-semibold mt-3">Maximum size: 5MB (PDF only)</p>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-150/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50">
                <h2 className="text-md font-extrabold text-slate-900 tracking-tight flex items-center">
                  <i className="fas fa-info-circle mr-2 text-slate-500"></i> Additional Information
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* College Name */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150/65 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <i className="fas fa-university mr-2 text-slate-400"></i> College/University Name
                    </label>
                    {!isEditingField.collegeName && (
                      <button
                        onClick={() => handleEditField('collegeName')}
                        className="text-slate-400 hover:text-slate-900 transition p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                        title="Edit College Name"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {isEditingField.collegeName ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={tempValues.collegeName}
                        onChange={(e) => handleFieldChange('collegeName', e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-950 text-xs text-slate-850 bg-slate-50"
                        placeholder="Enter your college/university name"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveField('collegeName')}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer transition duration-150"
                        >
                          <i className="fas fa-check mr-1 text-[10px]"></i> Save
                        </button>
                        <button
                          onClick={() => handleCancelEdit('collegeName')}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-xl text-xs font-bold cursor-pointer transition duration-150"
                        >
                          <i className="fas fa-times mr-1 text-[10px]"></i> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-slate-905">
                      {additionalInfo.collegeName || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Skills */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150/65 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <i className="fas fa-code mr-2 text-slate-400"></i> Skills
                    </label>
                    {!isEditingField.skills && (
                      <button
                        onClick={() => handleEditField('skills')}
                        className="text-slate-400 hover:text-slate-900 transition p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                        title="Edit Skills"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {isEditingField.skills ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={tempValues.skills}
                        onChange={(e) => handleFieldChange('skills', e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-950 text-xs text-slate-850 bg-slate-50"
                        placeholder="e.g., JavaScript, React, Node.js, Python"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveField('skills')}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer transition duration-150"
                        >
                          <i className="fas fa-check mr-1 text-[10px]"></i> Save
                        </button>
                        <button
                          onClick={() => handleCancelEdit('skills')}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-xl text-xs font-bold cursor-pointer transition duration-150"
                        >
                          <i className="fas fa-times mr-1 text-[10px]"></i> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-slate-905">
                      {additionalInfo.skills || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* About */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150/65 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <i className="fas fa-user-edit mr-2 text-slate-400"></i> About Me
                    </label>
                    {!isEditingField.about && (
                      <button
                        onClick={() => handleEditField('about')}
                        className="text-slate-400 hover:text-slate-900 transition p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                        title="Edit About"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {isEditingField.about ? (
                    <div className="space-y-3">
                      <textarea
                        value={tempValues.about}
                        onChange={(e) => handleFieldChange('about', e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-950 text-xs text-slate-850 bg-slate-50"
                        placeholder="Write something about yourself..."
                        rows="4"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveField('about')}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer transition duration-150"
                        >
                          <i className="fas fa-check mr-1 text-[10px]"></i> Save
                        </button>
                        <button
                          onClick={() => handleCancelEdit('about')}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-xl text-xs font-bold cursor-pointer transition duration-150"
                        >
                          <i className="fas fa-times mr-1 text-[10px]"></i> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 font-semibold whitespace-pre-wrap leading-relaxed">
                      {additionalInfo.about || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* LinkedIn Profile */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150/65 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <i className="fab fa-linkedin mr-2 text-slate-400"></i> LinkedIn Profile
                    </label>
                    {!isEditingField.linkedinProfile && (
                      <button
                        onClick={() => handleEditField('linkedinProfile')}
                        className="text-slate-400 hover:text-slate-900 transition p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                        title="Edit LinkedIn Profile"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {isEditingField.linkedinProfile ? (
                    <div className="space-y-3">
                      <input
                        type="url"
                        value={tempValues.linkedinProfile}
                        onChange={(e) => handleFieldChange('linkedinProfile', e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-950 text-xs text-slate-850 bg-slate-50"
                        placeholder="https://www.linkedin.com/in/yourprofile"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveField('linkedinProfile')}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer transition duration-150"
                        >
                          <i className="fas fa-check mr-1 text-[10px]"></i> Save
                        </button>
                        <button
                          onClick={() => handleCancelEdit('linkedinProfile')}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-xl text-xs font-bold cursor-pointer transition duration-150"
                        >
                          <i className="fas fa-times mr-1 text-[10px]"></i> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-slate-700 break-all">
                      {additionalInfo.linkedinProfile ? (
                        <a href={additionalInfo.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">
                          {additionalInfo.linkedinProfile}
                        </a>
                      ) : 'Not specified'}
                    </p>
                  )}
                </div>

                {/* GitHub Profile */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150/65 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <i className="fab fa-github mr-2 text-slate-400"></i> GitHub Profile
                    </label>
                    {!isEditingField.githubProfile && (
                      <button
                        onClick={() => handleEditField('githubProfile')}
                        className="text-slate-400 hover:text-slate-900 transition p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                        title="Edit GitHub Profile"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {isEditingField.githubProfile ? (
                    <div className="space-y-3">
                      <input
                        type="url"
                        value={tempValues.githubProfile}
                        onChange={(e) => handleFieldChange('githubProfile', e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-950 text-xs text-slate-850 bg-slate-50"
                        placeholder="https://github.com/yourusername"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveField('githubProfile')}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer transition duration-150"
                        >
                          <i className="fas fa-check mr-1 text-[10px]"></i> Save
                        </button>
                        <button
                          onClick={() => handleCancelEdit('githubProfile')}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-xl text-xs font-bold cursor-pointer transition duration-150"
                        >
                          <i className="fas fa-times mr-1 text-[10px]"></i> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-slate-700 break-all">
                      {additionalInfo.githubProfile ? (
                        <a href={additionalInfo.githubProfile} target="_blank" rel="noopener noreferrer" className="text-slate-900 hover:underline font-bold">
                          {additionalInfo.githubProfile}
                        </a>
                      ) : 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Portfolio Website */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150/65 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <i className="fas fa-globe mr-2 text-slate-400"></i> Portfolio Website
                    </label>
                    {!isEditingField.portfolioWebsite && (
                      <button
                        onClick={() => handleEditField('portfolioWebsite')}
                        className="text-slate-400 hover:text-slate-900 transition p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                        title="Edit Portfolio Website"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {isEditingField.portfolioWebsite ? (
                    <div className="space-y-3">
                      <input
                        type="url"
                        value={tempValues.portfolioWebsite}
                        onChange={(e) => handleFieldChange('portfolioWebsite', e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-950 text-xs text-slate-855 bg-slate-50"
                        placeholder="https://yourportfolio.com"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveField('portfolioWebsite')}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer transition duration-150"
                        >
                          <i className="fas fa-check mr-1 text-[10px]"></i> Save
                        </button>
                        <button
                          onClick={() => handleCancelEdit('portfolioWebsite')}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-xl text-xs font-bold cursor-pointer transition duration-150"
                        >
                          <i className="fas fa-times mr-1 text-[10px]"></i> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-slate-700 break-all">
                      {additionalInfo.portfolioWebsite ? (
                        <a href={additionalInfo.portfolioWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">
                          {additionalInfo.portfolioWebsite}
                        </a>
                      ) : 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Work Experience */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150/65 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <i className="fas fa-briefcase mr-2 text-slate-400"></i> Work Experience
                    </label>
                    {!isEditingField.workExperience && (
                      <button
                        onClick={() => handleEditField('workExperience')}
                        className="text-slate-400 hover:text-slate-900 transition p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                        title="Edit Work Experience"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {isEditingField.workExperience ? (
                    <div className="space-y-3">
                      <textarea
                        value={tempValues.workExperience}
                        onChange={(e) => handleFieldChange('workExperience', e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-950 text-xs text-slate-850 bg-slate-50"
                        placeholder="Brief summary of your work experience..."
                        rows="4"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveField('workExperience')}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer transition duration-150"
                        >
                          <i className="fas fa-check mr-1 text-[10px]"></i> Save
                        </button>
                        <button
                          onClick={() => handleCancelEdit('workExperience')}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-xl text-xs font-bold cursor-pointer transition duration-150"
                        >
                          <i className="fas fa-times mr-1 text-[10px]"></i> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-650 font-semibold whitespace-pre-wrap leading-relaxed">
                      {additionalInfo.workExperience || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Achievements/Awards */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150/65 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <i className="fas fa-trophy mr-2 text-slate-400"></i> Achievements/Awards
                    </label>
                    {!isEditingField.achievements && (
                      <button
                        onClick={() => handleEditField('achievements')}
                        className="text-slate-400 hover:text-slate-900 transition p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                        title="Edit Achievements"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {isEditingField.achievements ? (
                    <div className="space-y-3">
                      <textarea
                        value={tempValues.achievements}
                        onChange={(e) => handleFieldChange('achievements', e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-950 text-xs text-slate-850 bg-slate-50"
                        placeholder="List your notable achievements and awards..."
                        rows="4"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveField('achievements')}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer transition duration-150"
                        >
                          <i className="fas fa-check mr-1 text-[10px]"></i> Save
                        </button>
                        <button
                          onClick={() => handleCancelEdit('achievements')}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-xl text-xs font-bold cursor-pointer transition duration-150"
                        >
                          <i className="fas fa-times mr-1 text-[10px]"></i> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-655 font-semibold whitespace-pre-wrap leading-relaxed">
                      {additionalInfo.achievements || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-rose-50 bg-rose-50/20">
                <h2 className="text-md font-extrabold text-rose-800 tracking-tight flex items-center">
                  <i className="fas fa-exclamation-triangle mr-2"></i> Danger Zone
                </h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Delete Account</h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      Permanently delete your account. This action is irreversible and all your data will be removed.
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm transition duration-205 cursor-pointer flex items-center"
                  >
                    <i className="fas fa-trash mr-1.5 text-[10px]"></i> Delete My Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileInfoCard = ({ icon, label, value }) => (
  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-all hover:bg-slate-100/50 duration-200">
    <label className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
      <i className={`fas ${icon} mr-1.5`}></i> {label}
    </label>
    <p className="text-sm text-slate-900 font-bold">{value || 'N/A'}</p>
  </div>
);

export default Profile;