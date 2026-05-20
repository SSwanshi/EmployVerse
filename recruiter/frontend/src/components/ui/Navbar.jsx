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
    <header className="bg-white border-b border-slate-100 text-slate-900 sticky top-0 z-50 shadow-sm">
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
            className="md:hidden text-slate-700 cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </div>
        </nav>

        {/* Mobile Navigation Menu */}
        {menuOpen && (
          <ul className="flex flex-col md:hidden bg-slate-50 border-t border-slate-100 p-4 space-y-3 rounded-b-xl">
            <li>
              <Link
                to="/dashboard"
                className="block py-2 text-slate-600 hover:text-blue-600 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/companies"
                className="block py-2 text-slate-600 hover:text-blue-600 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Companies
              </Link>
            </li>
            <li>
              <Link
                to="/jobs"
                className="block py-2 text-slate-600 hover:text-blue-600 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Jobs
              </Link>
            </li>
            <li>
              <Link
                to="/internships"
                className="block py-2 text-slate-600 hover:text-blue-600 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Internships
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    to="/profile"
                    className="block py-2 text-slate-600 hover:text-blue-600 font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="block py-2 text-red-600 hover:text-red-700 font-medium w-full text-left"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        )}
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
