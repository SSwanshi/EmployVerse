import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import profileService from "../services/profileService";
import { useToast } from "../contexts/ToastContext";

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
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
    <header className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex flex-col items-center">
                  {/* Profile Image */}
                  <div className="relative mb-4">
                    {/* Premium Crown Icon */}
                    {userData.isPremium && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="relative group">
                          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-full p-2 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2L15 8.5L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L9 8.5L12 2Z" />
                            </svg>
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
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
                        className="w-32 h-32 rounded-full border-4 border-blue-200 shadow-lg object-cover"
                        alt="Profile"
                        onError={(e) => {
                          console.error('Failed to load profile image');
                          // Hide image and show placeholder
                          const placeholder = e.target.nextElementSibling;
                          if (placeholder) {
                            e.target.style.display = 'none';
                            placeholder.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-32 h-32 flex items-center justify-center rounded-full border-4 border-blue-200 shadow-lg bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 text-4xl font-bold ${profileImageUrl ? 'hidden' : ''}`}
                    >
                      {userData.firstName?.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900">
                    {userData.firstName} {userData.lastName}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">{userData.email}</p>

                  {/* Image Upload Form */}
                  <form onSubmit={handleProfileImageUpload} className="w-full">
                    <div className="mb-3">
                      <label 
                        htmlFor="profileImageInput"
                        className="flex flex-col items-center justify-center w-full h-10 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300 hover:border-blue-500 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-1 pb-1">
                          <i className="fas fa-camera text-gray-500 mb-1"></i>
                          <p className="text-xs text-gray-600">Change Photo</p>
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
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                      >
                        <i className="fas fa-upload mr-1"></i> Upload
                      </button>
                      {userData.profileImageId && (
                        <button
                          type="button"
                          onClick={handleDeleteProfileImage}
                          className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition flex items-center justify-center"
                        >
                          <i className="fas fa-trash mr-1"></i> Del
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  ------ Quick Actions ------
                </h3>
                <div className="space-y-3">
                  <Link
                    to="/profile/edit"
                    className="flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition group"
                  >
                    <i className="fas fa-edit mr-3 text-blue-600"></i>
                    <span>Edit Profile</span>
                    <i className="fas fa-chevron-right ml-auto text-blue-400 group-hover:text-blue-600"></i>
                  </Link>
                  <Link
                    to="/jobs"
                    className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition group"
                  >
                    <i className="fas fa-briefcase mr-3 text-green-600"></i>
                    <span>Browse Jobs</span>
                    <i className="fas fa-chevron-right ml-auto text-green-400 group-hover:text-green-600"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Profile Information */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4">
                  <h2 className="text-xl font-bold text-black flex items-center">
                    <i className="fas fa-user-circle mr-3"></i> Profile Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4">
                  <h2 className="text-xl font-bold text-black flex items-center">
                    <i className="fas fa-file-alt mr-3"></i> Resume Section
                  </h2>
                </div>
                <div className="p-6">
                  {resumeName ? (
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-green-50 rounded-xl border border-green-200">
                      <div className="mb-4 md:mb-0">
                        <p className="text-gray-700 font-medium mb-1">
                          <i className="fas fa-file-pdf text-red-500 mr-2"></i> Uploaded Resume
                        </p>
                        <p className="text-gray-900 font-semibold">{resumeName}</p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleViewResume}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
                        >
                          <i className="fas fa-eye mr-2"></i> View
                        </button>
                        <button
                          onClick={handleDeleteResume}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex items-center"
                        >
                          <i className="fas fa-trash mr-2"></i> Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleResumeUpload}>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                        <i className="fas fa-file-upload text-gray-400 text-4xl mb-4"></i>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Upload Your Resume</h3>
                        <p className="text-gray-500 mb-4">Drag & drop your resume here or click to browse</p>
                        <label className="block mb-4">
                          <span className="sr-only">Choose resume file</span>
                          <input
                            type="file"
                            id="resumeFile"
                            name="resume"
                            accept=".pdf"
                            required
                            className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-lg file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100"
                          />
                        </label>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center mx-auto"
                        >
                          <i className="fas fa-cloud-upload-alt mr-2"></i> Upload Resume
                        </button>
                        <p className="text-xs text-gray-500 mt-3">Maximum size: 5MB (PDF only)</p>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Application History */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4">
                  <h2 className="text-xl font-bold text-black flex items-center">
                    <i className="fas fa-history mr-3"></i> Application History
                  </h2>
                </div>
                <div className="p-6">
                  {applicationHistory && applicationHistory.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-blue-200">
                        <thead className="bg-gradient-to-br from-blue-600 to-indigo-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Company
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Applied Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {applicationHistory.map((app, index) => (
                            <tr key={index} className="hover:bg-blue-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {app.type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.title}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.company}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(app.appliedAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    app.status === 'Pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : app.status === 'Accepted'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {app.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <i className="fas fa-file-alt text-gray-300 text-5xl mb-4"></i>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        You haven't applied to any jobs or internships yet. Start your job search today!
                      </p>
                      <Link
                        to="/jobs"
                        className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                      >
                        <i className="fas fa-briefcase mr-2"></i> Browse Jobs
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4">
                  <h2 className="text-xl font-bold text-black flex items-center">
                    <i className="fas fa-info-circle mr-3"></i> Additional Information
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* College Name */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <label className="flex items-center text-sm font-medium text-purple-700">
                        <i className="fas fa-university mr-2"></i> College/University Name
                      </label>
                      {!isEditingField.collegeName && (
                        <button
                          onClick={() => handleEditField('collegeName')}
                          className="text-purple-600 hover:text-purple-800 transition p-1 hover:bg-purple-100 rounded"
                          title="Edit College Name"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
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
                          className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                          placeholder="Enter your college/university name"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveField('collegeName')}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                          >
                            <i className="fas fa-check mr-1"></i> Save
                          </button>
                          <button
                            onClick={() => handleCancelEdit('collegeName')}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
                          >
                            <i className="fas fa-times mr-1"></i> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-lg text-gray-900">
                        {additionalInfo.collegeName || 'Not specified'}
                      </p>
                    )}
                  </div>

                  {/* Skills */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <label className="flex items-center text-sm font-medium text-green-700">
                        <i className="fas fa-code mr-2"></i> Skills
                      </label>
                      {!isEditingField.skills && (
                        <button
                          onClick={() => handleEditField('skills')}
                          className="text-green-600 hover:text-green-800 transition p-1 hover:bg-green-100 rounded"
                          title="Edit Skills"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
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
                          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                          placeholder="e.g., JavaScript, React, Node.js, Python"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveField('skills')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                          >
                            <i className="fas fa-check mr-1"></i> Save
                          </button>
                          <button
                            onClick={() => handleCancelEdit('skills')}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
                          >
                            <i className="fas fa-times mr-1"></i> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-lg text-gray-900">
                        {additionalInfo.skills || 'Not specified'}
                      </p>
                    )}
                  </div>

                  {/* About */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <label className="flex items-center text-sm font-medium text-blue-700">
                        <i className="fas fa-user-edit mr-2"></i> About Me
                      </label>
                      {!isEditingField.about && (
                        <button
                          onClick={() => handleEditField('about')}
                          className="text-blue-600 hover:text-blue-800 transition p-1 hover:bg-blue-100 rounded"
                          title="Edit About"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
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
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="Write something about yourself..."
                          rows="4"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveField('about')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                          >
                            <i className="fas fa-check mr-1"></i> Save
                          </button>
                          <button
                            onClick={() => handleCancelEdit('about')}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
                          >
                            <i className="fas fa-times mr-1"></i> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-base text-gray-900 whitespace-pre-wrap">
                        {additionalInfo.about || 'Not specified'}
                      </p>
                    )}
                  </div>

                  {/* LinkedIn Profile */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <label className="flex items-center text-sm font-medium text-blue-600">
                        <i className="fab fa-linkedin mr-2"></i> LinkedIn Profile
                      </label>
                      {!isEditingField.linkedinProfile && (
                        <button
                          onClick={() => handleEditField('linkedinProfile')}
                          className="text-blue-600 hover:text-blue-800 transition p-1 hover:bg-blue-100 rounded"
                          title="Edit LinkedIn Profile"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
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
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="https://www.linkedin.com/in/yourprofile"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveField('linkedinProfile')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                          >
                            <i className="fas fa-check mr-1"></i> Save
                          </button>
                          <button
                            onClick={() => handleCancelEdit('linkedinProfile')}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
                          >
                            <i className="fas fa-times mr-1"></i> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-base text-gray-900 break-all">
                        {additionalInfo.linkedinProfile ? (
                          <a href={additionalInfo.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {additionalInfo.linkedinProfile}
                          </a>
                        ) : 'Not specified'}
                      </p>
                    )}
                  </div>

                  {/* GitHub Profile */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <label className="flex items-center text-sm font-medium text-gray-800">
                        <i className="fab fa-github mr-2"></i> GitHub Profile
                      </label>
                      {!isEditingField.githubProfile && (
                        <button
                          onClick={() => handleEditField('githubProfile')}
                          className="text-gray-700 hover:text-gray-900 transition p-1 hover:bg-gray-100 rounded"
                          title="Edit GitHub Profile"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900"
                          placeholder="https://github.com/yourusername"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveField('githubProfile')}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition text-sm"
                          >
                            <i className="fas fa-check mr-1"></i> Save
                          </button>
                          <button
                            onClick={() => handleCancelEdit('githubProfile')}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
                          >
                            <i className="fas fa-times mr-1"></i> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-base text-gray-900 break-all">
                        {additionalInfo.githubProfile ? (
                          <a href={additionalInfo.githubProfile} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:underline">
                            {additionalInfo.githubProfile}
                          </a>
                        ) : 'Not specified'}
                      </p>
                    )}
                  </div>

                  {/* Portfolio Website */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <label className="flex items-center text-sm font-medium text-indigo-700">
                        <i className="fas fa-globe mr-2"></i> Portfolio Website
                      </label>
                      {!isEditingField.portfolioWebsite && (
                        <button
                          onClick={() => handleEditField('portfolioWebsite')}
                          className="text-indigo-600 hover:text-indigo-800 transition p-1 hover:bg-indigo-100 rounded"
                          title="Edit Portfolio Website"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
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
                          className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                          placeholder="https://yourportfolio.com"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveField('portfolioWebsite')}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                          >
                            <i className="fas fa-check mr-1"></i> Save
                          </button>
                          <button
                            onClick={() => handleCancelEdit('portfolioWebsite')}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
                          >
                            <i className="fas fa-times mr-1"></i> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-base text-gray-900 break-all">
                        {additionalInfo.portfolioWebsite ? (
                          <a href={additionalInfo.portfolioWebsite} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                            {additionalInfo.portfolioWebsite}
                          </a>
                        ) : 'Not specified'}
                      </p>
                    )}
                  </div>

                  {/* Work Experience */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <label className="flex items-center text-sm font-medium text-orange-700">
                        <i className="fas fa-briefcase mr-2"></i> Work Experience
                      </label>
                      {!isEditingField.workExperience && (
                        <button
                          onClick={() => handleEditField('workExperience')}
                          className="text-orange-600 hover:text-orange-800 transition p-1 hover:bg-orange-100 rounded"
                          title="Edit Work Experience"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
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
                          className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                          placeholder="Brief summary of your work experience..."
                          rows="4"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveField('workExperience')}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm"
                          >
                            <i className="fas fa-check mr-1"></i> Save
                          </button>
                          <button
                            onClick={() => handleCancelEdit('workExperience')}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
                          >
                            <i className="fas fa-times mr-1"></i> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-base text-gray-900 whitespace-pre-wrap">
                        {additionalInfo.workExperience || 'Not specified'}
                      </p>
                    )}
                  </div>

                  {/* Achievements/Awards */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <label className="flex items-center text-sm font-medium text-yellow-700">
                        <i className="fas fa-trophy mr-2"></i> Achievements/Awards
                      </label>
                      {!isEditingField.achievements && (
                        <button
                          onClick={() => handleEditField('achievements')}
                          className="text-yellow-600 hover:text-yellow-800 transition p-1 hover:bg-yellow-100 rounded"
                          title="Edit Achievements"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
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
                          className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                          placeholder="List your notable achievements and awards..."
                          rows="4"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveField('achievements')}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm"
                          >
                            <i className="fas fa-check mr-1"></i> Save
                          </button>
                          <button
                            onClick={() => handleCancelEdit('achievements')}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
                          >
                            <i className="fas fa-times mr-1"></i> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-base text-gray-900 whitespace-pre-wrap">
                        {additionalInfo.achievements || 'Not specified'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-red-200">
                <div className="px-6 py-4">
                  <h2 className="text-xl font-bold text-black flex items-center">
                    <i className="fas fa-exclamation-triangle mr-3"></i> Danger Zone
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-lg font-semibold text-red-800 mb-1">Delete Account</h3>
                      <p className="text-red-700">
                        Permanently delete your account. This action is irreversible.
                      </p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition flex items-center"
                    >
                      <i className="fas fa-trash mr-2"></i> Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
  );
};

const ProfileInfoCard = ({ icon, label, value }) => (
  <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 transition-all hover:shadow-sm">
    <label className="flex items-center text-sm font-medium text-blue-700 mb-1">
      <i className={`fas ${icon} mr-2`}></i> {label}
    </label>
    <p className="text-lg text-gray-900 font-semibold">{value}</p>
  </div>
);

export default Profile;