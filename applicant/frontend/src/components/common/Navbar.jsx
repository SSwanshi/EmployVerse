import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navbarScrolled, setNavbarScrolled] = useState(false);

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
      className={`bg-gradient-to-r from-blue-700 to-blue-500 shadow-xl fixed w-full z-10 transition-all duration-300 ${
        navbarScrolled ? 'py-3 bg-blue-700 shadow-2xl' : 'p-5'
      }`}
      id="navbar"
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-black text-3xl font-bold transition-transform hover:scale-105 duration-300 ml-2"
        >
          Go<span className="text-yellow-400">Hire</span>
        </Link>

        {/* Search bar */}
        <div className="relative w-1/3 group">
          <form onSubmit={handleSearch} id="search-form">
            <input
                id="search-space"
                type="text"
                placeholder="Search for Opportunities"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full p-3 rounded-full bg-gray-200 text-black border-2 border-black-300 focus:outline-none focus:ring-2       focus:ring-yellow-400 transition-all duration-300 shadow-md placeholder:text-gray-700"
            />
          </form>
          <div className="absolute right-3 top-3.5 text-yellow-500">
            <button
              type="button"
              onClick={handleSearch}
              id="search-btn"
              className="cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-8 text-white">
          <li>
            <Link
              to="/"
              className="hover:text-yellow-300 transition-colors duration-300 font-extrabold"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/jobs"
              className="hover:text-yellow-300 transition-colors duration-300 font-extrabold"
            >
              Jobs
            </Link>
          </li>
          <li>
            <Link
              to="/internships"
              className="hover:text-yellow-300 transition-colors duration-300 font-extrabold"
            >
              Internship
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className="hover:text-yellow-300 transition-colors duration-300 font-extrabold"
            >
              Contact Us
            </Link>
          </li>
          {isAuthenticated ? (
            <li className="relative group flex items-center">
              <button className="bg-yellow-400 hover:bg-yellow-500 text-blue-800 font-black py-2 px-4 rounded-full transition-all duration-300 hover:shadow-lg flex items-center">
                {user?.profileImageId ? (
                  <img
                    src={`/profile/image`}
                    className="w-8 h-8 rounded-full object-cover mr-2 border-2 border-blue-800"
                    alt="Profile"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center mr-2 font-bold text-sm">
                    {user?.firstName?.charAt(0).toUpperCase() || 'P'}
                  </div>
                )}
                <span className="leading-none flex items-center">
                  {user?.firstName || 'Profile'}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1 transform transition-transform duration-300 group-hover:rotate-180"
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
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform -translate-y-2 group-hover:translate-y-0">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-blue-800 hover:bg-blue-50 rounded-t-lg"
                >
                  My Profile
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-blue-800 hover:bg-blue-50"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-blue-800 hover:bg-blue-50 rounded-b-lg"
                >
                  Logout
                </button>
              </div>
            </li>
          ) : (
            <li>
              <Link
                to="/login"
                className="bg-yellow-400 hover:bg-yellow-500 text-blue-800 font-black py-2 px-6 rounded-full transition-all duration-300 hover:shadow-lg flex items-center"
              >
                Login
              </Link>
            </li>
          )}
        </ul>

        {/* Mobile Menu */}
        <div className="md:hidden relative" id="mobile-menu-container">
          <div
            className="flex flex-col space-y-1 cursor-pointer"
            id="mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="block w-6 h-0.5 bg-white transition-all duration-300"></span>
            <span className="block w-6 h-0.5 bg-white transition-all duration-300"></span>
            <span className="block w-6 h-0.5 bg-white transition-all duration-300"></span>
          </div>
          <ul
            id="dropdown-menu"
            className={`absolute right-0 mt-10 w-40 bg-yellow-500 text-blue-500 rounded-lg shadow-lg flex flex-col text-blue-800 ${
              mobileMenuOpen ? 'block' : 'hidden'
            }`}
          >
            <li>
              <Link
                to="/"
                className="block px-4 py-2 hover:bg-blue-500 hover:text-yellow-500 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/jobs"
                className="block px-4 py-2 hover:bg-blue-500 hover:text-yellow-500 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Jobs
              </Link>
            </li>
            <li>
              <Link
                to="/internships"
                className="block px-4 py-2 hover:bg-blue-500 hover:text-yellow-500 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Internships
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="block px-4 py-2 hover:bg-blue-500 hover:text-yellow-500 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
            </li>
            {isAuthenticated ? (
              <li className="relative group flex justify-center">
                <button className="bg-yellow-400 hover:bg-blue-500 text-blue-800 font-black py-2 px-6 rounded-full transition-all duration-300 hover:shadow-lg flex items-center justify-center">
                  {user?.firstName || 'Profile'}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1 transform transition-transform duration-300 group-hover:rotate-180"
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform -translate-y-2 group-hover:translate-y-0 flex justify-center flex-col">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-blue-800 hover:bg-blue-50 rounded-t-lg"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-blue-800 hover:bg-blue-50"
                  >
                    My Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-blue-800 hover:bg-blue-50 rounded-b-lg"
                  >
                    Logout
                  </button>
                </div>
              </li>
            ) : (
              <li>
                <Link
                  to="/login"
                  className="bg-yellow-400 hover:bg-yellow-500 text-blue-800 font-black py-2 px-6 rounded-full transition-all duration-300 hover:shadow-lg flex justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
