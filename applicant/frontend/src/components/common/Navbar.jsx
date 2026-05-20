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
      className={`bg-white fixed w-full z-20 transition-all duration-300 border-b border-slate-100 ${
        navbarScrolled ? 'py-3.5 shadow-md bg-white/95 backdrop-blur-md' : 'py-5.5 shadow-sm bg-white'
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
        <div className="relative w-2/5 md:max-w-md group hidden sm:block">
          <form onSubmit={handleSearch} id="search-form">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/20 to-slate-800/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <input
                id="search-space"
                type="text"
                placeholder="Search for opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="relative w-full py-3 px-5 pr-12 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 border-2 border-slate-400/60 focus:outline-none focus:ring-4 focus:ring-slate-900/30 focus:border-black transition-all duration-300 text-sm placeholder:text-slate-600 font-medium shadow-lg shadow-slate-900/10 hover:border-slate-600 hover:shadow-slate-900/20"
              />
            </div>
          </form>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 hover:text-black transition-colors">
            <button
              type="button"
              onClick={handleSearch}
              id="search-btn"
              className="cursor-pointer flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
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
        <div className="md:hidden relative" id="mobile-menu-container">
          <div
            className="flex flex-col space-y-1 cursor-pointer p-2"
            id="mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="block w-5 h-0.5 bg-slate-900 transition-all duration-300"></span>
            <span className="block w-5 h-0.5 bg-slate-900 transition-all duration-300"></span>
            <span className="block w-5 h-0.5 bg-slate-900 transition-all duration-300"></span>
          </div>
          <ul
            id="dropdown-menu"
            className={`absolute right-0 mt-3 w-48 bg-white border border-slate-100 rounded-xl shadow-xl flex flex-col py-2 ${
              mobileMenuOpen ? 'block' : 'hidden'
            }`}
          >
            <li>
              <Link
                to="/"
                className="block px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-blue-600 text-sm font-semibold text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/jobs"
                className="block px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-blue-600 text-sm font-semibold text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Jobs
              </Link>
            </li>
            <li>
              <Link
                to="/internships"
                className="block px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-blue-600 text-sm font-semibold text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Internships
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="block px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-blue-600 text-sm font-semibold text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
            </li>
            {isAuthenticated ? (
              <li className="relative group flex flex-col pt-2 border-t border-slate-100">
                <Link
                  to="/profile"
                  className="block px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-blue-600 text-sm font-semibold text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-blue-600 text-sm font-semibold text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-blue-600 text-sm font-semibold text-center cursor-pointer"
                >
                  Logout
                </button>
              </li>
            ) : (
              <li className="pt-2 border-t border-slate-100 mx-2">
                <Link
                  to="/login"
                  className="block bg-slate-900 hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-sm text-center transition-all animate-none"
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
