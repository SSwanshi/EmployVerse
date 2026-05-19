import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { useAuth } from '../hooks/useAuth';
import { Pencil, Upload, Trash2, LogOut, Lock, User as UserIcon, Crown } from 'lucide-react';
import defaultImage from '../assets/images/default.png';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE || 'https://gohire-recruiter.onrender.com';

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authApi.getProfile();
      if (response.success) {
        setProfile(response.user);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Something went wrong while loading profile.');
    } finally {
      setLoading(false);
    }
  };

  const getProfileImageUrl = () => {
    if (profile?.profileImage?.data) {
      return authApi.getProfileImage(profile.id);
    }
    return defaultImage;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('image', file);

      const response = await authApi.uploadProfileImage(formData);
      if (response.success) {
        setSuccess('Profile image updated successfully!');
        setImagePreview(null);
        await fetchProfile();
        // Update auth context
        if (authUser) {
          window.location.reload(); // Simple way to refresh session
        }
      } else {
        setError(response.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Are you sure you want to remove your profile image?')) {
      return;
    }

    try {
      setUploading(true);
      setError('');
      // Since there's no delete endpoint, we'll upload an empty/null value
      // Or we can just clear it in the frontend and notify the user
      // For now, let's show a message that this needs backend support
      setError('Kuch to gadbad hai.');
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete profile image');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getGenderDisplay = (gender) => {
    if (!gender) return 'Not specified';
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded">
          {error || 'Failed to load profile'}
        </div>
      </div>
    );
  }

  const displayImage = imagePreview || getProfileImageUrl();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32"></div>
          <div className="px-6 pb-6 -mt-16">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img
                  src={displayImage}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
                  onError={(e) => {
                    e.target.src = defaultImage;
                  }}
                />
                {profile.isPremium && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 shadow-md">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">Uploading...</span>
                  </div>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-4">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-gray-600 mt-1">{profile.email}</p>

              {/* Image Action Buttons */}
              <div className="flex gap-2 mt-4">
                <label className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {imagePreview ? 'Change Image' : 'Upload New'}
                    <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
                {profile.profileImage?.data && !imagePreview && (
                  <button
                    onClick={handleDeleteImage}
                    disabled={uploading}
                    className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                )}
              </div>
              {imagePreview && (
                <button
                  onClick={() => setImagePreview(null)}
                  className="mt-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Profile Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                First Name
              </label>
              <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
                {profile.firstName || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Last Name
              </label>
              <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
                {profile.lastName || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
                {profile.email || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Phone
              </label>
              <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
                {profile.phone || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Gender
              </label>
              <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
                {getGenderDisplay(profile.gender)}
              </p>
            </div>
            {profile.createdAt && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Member Since
                </label>
                <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/profile/edit')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold shadow-md transition-colors"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
            <button
              onClick={() => navigate('/profile/change-password')}
              className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
            >
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors ml-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
