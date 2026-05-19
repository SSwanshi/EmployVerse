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
    <header className="gradient-blue shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center py-4">
          {/* Brand Logo */}
          <div>
            <h2 className="text-2xl font-bold text-white">
              <span style={{ color: "#dfcc24" }}>Go</span>Hire
            </h2>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex space-x-8 items-center">
            <li>
              <Link
                to="/dashboard"
                className="hover:text-blue-900 font-medium transition-colors duration-300"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/companies"
                className="hover:text-blue-900 font-medium transition-colors duration-300"
              >
                Companies
              </Link>
            </li>
            <li>
              <Link
                to="/upgrade"
                className="hover:text-blue-900 font-medium transition-colors duration-300"
              >
                Upgrade
              </Link>
            </li>
            <li>
              <Link
                to="/jobs"
                className="hover:text-blue-900 font-medium transition-colors duration-300"
              >
                Jobs
              </Link>
            </li>
            <li>
              <Link
                to="/internships"
                className="hover:text-blue-900 font-medium transition-colors duration-300"
              >
                Internships
              </Link>
            </li>

            {isAuthenticated ? (
              <li className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity focus:outline-none"
                >
                  <img
                    src={getProfileImageUrl()}
                    alt={user?.firstName || "Profile"}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
                    onError={(e) => {
                      e.target.src = defaultImage;
                    }}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <button
                      onClick={handleViewProfile}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center transition-colors"
                    >
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 flex items-center transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <li>
                <Link
                  to="/login"
                  className="bg-white text-blue-600 px-4 py-2 rounded-md font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors duration-300 shadow-sm"
                >
                  Login
                </Link>
              </li>
            )}
          </ul>

          {/* Mobile Menu Toggle */}
          <div
            className="md:hidden text-white cursor-pointer"
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
          <ul className="flex flex-col md:hidden bg-blue-700 text-white p-4 space-y-4">
            <li>
              <Link
                to="/dashboard"
                className="hover:text-blue-900"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/companies"
                className="hover:text-blue-900"
                onClick={() => setMenuOpen(false)}
              >
                Companies
              </Link>
            </li>
            <li>
              <Link
                to="/jobs"
                className="hover:text-blue-900"
                onClick={() => setMenuOpen(false)}
              >
                Jobs
              </Link>
            </li>
            <li>
              <Link
                to="/internships"
                className="hover:text-blue-900"
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
                    className="hover:text-blue-900"
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
                    className="hover:text-blue-900 w-full text-left"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/login"
                  className="bg-white text-blue-600 px-4 py-2 rounded-md font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors duration-300 inline-block"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Embedded gradient styles */}
      <style>{`
        .gradient-blue {
          background: linear-gradient(to right, #1d4ed8, #ffe819);
        }
        .hover-grow {
          transition: transform 0.2s;
        }
        .hover-grow:hover {
          transform: scale(1.03);
        }
      `}</style>
    </header>
  );
};

export default Navbar;
