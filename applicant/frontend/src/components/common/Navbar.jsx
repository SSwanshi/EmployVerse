import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import FuzzySearch from './FuzzySearch';
import NotificationDropdown from './NotificationDropdown';
import { applicantApi } from '../../services/applicantApi';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const [searchData, setSearchData] = useState([]);
  
  // Memoize keys so Fuse doesn't re-instantiate on scroll
  const searchKeys = useMemo(() => ['title', 'company', 'location'], []);

  // Fetch data for fuzzy search on mount
  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const [jobsRes, intRes] = await Promise.all([
          applicantApi.getJobs(''),
          applicantApi.getInternships('')
        ]);
        
        const jobs = jobsRes?.jobs || [];
        const internships = intRes?.internships || [];
        
        const formattedData = [
          ...jobs.filter(j => j && j.jobTitle).map(j => ({
            id: j._id,
            title: j.jobTitle,
            company: j.jobCompany?.companyName || 'Unknown',
            location: j.jobLocation || '',
            type: 'Job'
          })),
          ...internships.filter(i => i && i.intProfile).map(i => ({
            id: i._id,
            title: i.intProfile,
            company: i.intCompany?.companyName || 'Unknown',
            location: i.intLocation || '',
            type: 'Internship'
          }))
        ];
        
        setSearchData(formattedData);
      } catch (err) {
        console.error("Failed to fetch search data for Navbar suggestions", err);
      }
    };
    
    fetchSearchData();
  }, []);

  // Handle scroll for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setNavbarScrolled(true);
      } else {
        setNavbarScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav
      className={`bg-white fixed w-full z-50 transition-all duration-300 border-b border-slate-100 ${
        navbarScrolled && !mobileMenuOpen ? 'py-3.5 shadow-md bg-white/95 backdrop-blur-md' : 'py-5.5 shadow-sm bg-white'
      }`}
      id="navbar"
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-slate-900 text-3xl font-black transition-transform hover:scale-102 duration-300 tracking-tight flex items-center"
        >
          <span className="text-blue-600">Employ</span>Verse
        </Link>

        {/* Search bar */}
        <div className="relative w-2/5 md:max-w-md group hidden sm:block z-50">
          <FuzzySearch 
            data={searchData}
            keys={searchKeys}
            placeholder="Search for opportunities..."
            onSelect={(item) => navigate(`/search?q=${encodeURIComponent(item.title)}`)}
          />
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-10 text-slate-600 text-sm font-semibold">
          <li>
            <Link
              to="/"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/jobs"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Jobs
            </Link>
          </li>
          <li>
            <Link
              to="/internships"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Internships
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Contact Us
            </Link>
          </li>
          {isAuthenticated && (
            <li>
              <NotificationDropdown />
            </li>
          )}
          {isAuthenticated ? (
            <li className="relative group flex items-center">
              <button className="bg-slate-900 hover:bg-black text-white font-bold py-2.5 px-4.5 rounded-xl transition-all duration-300 hover:shadow-md flex items-center text-sm cursor-pointer">
                {user?.profileImageId ? (
                  <img
                    src={`/profile/image`}
                    className="w-5 h-5 rounded-full object-cover mr-2 border border-slate-700"
                    alt="Profile"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2 font-bold text-[10px]">
                    {user?.firstName?.charAt(0).toUpperCase() || 'P'}
                  </div>
                )}
                <span className="leading-none flex items-center mr-1">
                  {user?.firstName || 'Profile'}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 ml-1 transform transition-transform duration-300 group-hover:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform -translate-y-2 group-hover:translate-y-0">
                <Link
                  to="/profile"
                  className="block px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-blue-600 text-sm font-semibold rounded-t-xl"
                >
                  My Profile
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-blue-600 text-sm font-semibold"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-blue-600 text-sm font-semibold rounded-b-xl cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </li>
          ) : (
            <li>
              <Link
                to="/login"
                className="bg-slate-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 hover:shadow-md flex items-center text-sm"
              >
                Login
              </Link>
            </li>
          )}
        </ul>

        {/* Mobile Menu */}
        <div className="md:hidden relative flex items-center gap-3" id="mobile-menu-container">
          {isAuthenticated && (
            <NotificationDropdown />
          )}
          <button
            className="flex flex-col justify-center items-center cursor-pointer p-2 rounded-full hover:bg-slate-100 transition-colors z-50 relative"
            id="mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-slate-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
          
          {/* Mobile Menu Overlay */}
          <div
            className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
              mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Mobile Menu Content */}
          <ul
            id="dropdown-menu"
            className={`fixed top-0 right-0 h-full w-[80vw] max-w-sm bg-white shadow-2xl z-50 flex flex-col py-20 px-6 overflow-y-auto transition-transform duration-300 ease-in-out transform ${
              mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="absolute top-6 left-6">
              <Link
                to="/"
                className="text-slate-900 text-2xl font-black tracking-tight flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-blue-600">Employ</span>Verse
              </Link>
            </div>
            
            <li className="mt-8">
              <Link
                to="/"
                className="block py-4 text-slate-800 hover:text-blue-600 text-lg font-bold border-b border-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/jobs"
                className="block py-4 text-slate-800 hover:text-blue-600 text-lg font-bold border-b border-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Jobs
              </Link>
            </li>
            <li>
              <Link
                to="/internships"
                className="block py-4 text-slate-800 hover:text-blue-600 text-lg font-bold border-b border-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Internships
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="block py-4 text-slate-800 hover:text-blue-600 text-lg font-bold border-b border-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
            </li>
                
            <div className="mt-auto pt-8">
              {isAuthenticated ? (
                <li className="flex flex-col space-y-4">
                  <div className="flex items-center mb-4">
                    {user?.profileImageId ? (
                      <img
                        src={`/profile/image`}
                        className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-slate-200"
                        alt="Profile"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mr-4 font-bold text-lg shadow-md">
                        {user?.firstName?.charAt(0).toUpperCase() || 'P'}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-900">{user?.firstName || 'User'}</p>
                      <p className="text-xs text-slate-500 font-semibold cursor-pointer" onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>View Profile</p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="block w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-center font-bold rounded-xl transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-600 text-center font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </li>
              ) : (
                <li className="flex flex-col space-y-4">
                  <Link
                    to="/login"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-center shadow-lg shadow-blue-500/30 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login to Your Account
                  </Link>
                  <p className="text-center text-xs text-slate-500 font-medium">Join EmployVerse today and accelerate your career</p>
                </li>
              )}
            </div>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
