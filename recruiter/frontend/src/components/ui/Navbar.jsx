import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { User, LogOut } from "lucide-react";
import { authApi } from "../../services/authApi";
import defaultImage from "../../assets/images/default.png";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/login");
  };

  const handleViewProfile = () => {
    setDropdownOpen(false);
    navigate("/profile");
  };

  const getProfileImageUrl = () => {
    if (user?.id) {
      return authApi.getProfileImage(user.id);
    }
    return defaultImage;
  };

  return (
    <header className={`bg-white border-b border-slate-100 text-slate-900 sticky top-0 z-50 transition-all duration-300 ${
      menuOpen ? 'shadow-sm' : 'shadow-sm backdrop-blur-md bg-white/95'
    }`}>
      <div className="container mx-auto px-6">
        <nav className="flex justify-between items-center py-4">
          {/* Brand Logo */}
          <div>
            <Link to="/dashboard" className="text-2xl font-extrabold tracking-tight hover:opacity-90 transition-opacity">
              <span className="text-blue-600">Employ</span><span className="text-slate-900">Verse</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex space-x-8 items-center">
            <li>
              <Link
                to="/dashboard"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/companies"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Companies
              </Link>
            </li>
            <li>
              <Link
                to="/upgrade"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Upgrade
              </Link>
            </li>
            <li>
              <Link
                to="/jobs"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Jobs
              </Link>
            </li>
            <li>
              <Link
                to="/internships"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Internships
              </Link>
            </li>

            {isAuthenticated ? (
              <li className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 hover:opacity-90 transition-opacity focus:outline-none"
                >
                  <img
                    src={getProfileImageUrl()}
                    alt={user?.firstName || "Profile"}
                    className="w-10 h-10 rounded-full border border-slate-200 shadow-sm object-cover"
                    onError={(e) => {
                      e.target.src = defaultImage;
                    }}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-50 border border-slate-100">
                    <button
                      onClick={handleViewProfile}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors font-medium"
                    >
                      <User className="h-4 w-4 mr-2.5 text-slate-400" />
                      View Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors font-medium border-t border-slate-100"
                    >
                      <LogOut className="h-4 w-4 mr-2.5 text-red-400" />
                      Logout
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <li>
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-sm shadow-blue-100 text-sm"
                >
                  Login
                </Link>
              </li>
            )}
          </ul>

          {/* Mobile Menu Toggle */}
          <div
            className="md:hidden flex items-center" id="mobile-menu-container"
          >
            <button
              className="flex flex-col justify-center items-center cursor-pointer p-2 rounded-full hover:bg-slate-100 transition-colors z-50 relative"
              id="mobile-menu"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle mobile menu"
            >
              {menuOpen ? (
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
                menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}
              onClick={() => setMenuOpen(false)}
            ></div>

            {/* Mobile Menu Content */}
            <ul
              className={`fixed top-0 right-0 h-full w-[80vw] max-w-sm bg-white shadow-2xl z-50 flex flex-col py-20 px-6 overflow-y-auto transition-transform duration-300 ease-in-out transform ${
                menuOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="absolute top-6 left-6">
                <Link
                  to="/dashboard"
                  className="text-2xl font-extrabold tracking-tight hover:opacity-90 transition-opacity flex items-center"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-blue-600">Employ</span><span className="text-slate-900">Verse</span>
                </Link>
              </div>

              <li className="mt-8">
                <Link
                  to="/dashboard"
                  className="block py-4 text-slate-800 hover:text-blue-600 text-lg font-bold border-b border-slate-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/companies"
                  className="block py-4 text-slate-800 hover:text-blue-600 text-lg font-bold border-b border-slate-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Companies
                </Link>
              </li>
              <li>
                <Link
                  to="/jobs"
                  className="block py-4 text-slate-800 hover:text-blue-600 text-lg font-bold border-b border-slate-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Jobs
                </Link>
              </li>
              <li>
                <Link
                  to="/internships"
                  className="block py-4 text-slate-800 hover:text-blue-600 text-lg font-bold border-b border-slate-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Internships
                </Link>
              </li>

              <div className="mt-auto pt-8">
                {isAuthenticated ? (
                  <li className="flex flex-col space-y-4">
                    <div className="flex items-center mb-4">
                      <img
                        src={getProfileImageUrl()}
                        alt={user?.firstName || "Profile"}
                        className="w-12 h-12 rounded-full border-2 border-slate-200 shadow-sm object-cover mr-4"
                        onError={(e) => {
                          e.target.src = defaultImage;
                        }}
                      />
                      <div>
                        <p className="font-bold text-slate-900">{user?.firstName || 'User'}</p>
                        <p className="text-xs text-slate-500 font-semibold cursor-pointer" onClick={() => { navigate('/profile'); setMenuOpen(false); }}>View Profile</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="block w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-center font-bold rounded-xl transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
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
                      onClick={() => setMenuOpen(false)}
                    >
                      Login to Your Account
                    </Link>
                  </li>
                )}
              </div>
            </ul>
          </div>
        </nav>
      </div>

      <style>{`
        .hover-grow {
          transition: transform 0.2s;
        }
        .hover-grow:hover {
          transform: scale(1.02);
        }
      `}</style>
    </header>
  );
};

export default Navbar;
