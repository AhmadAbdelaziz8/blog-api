import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Role } from "../types/index";

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md animate-fadeIn">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight hover:text-indigo-200 transition"
          >
            <span className="text-pink-300">Blog</span>Platform
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink to="/" active={isActivePath("/")}>
              Home
            </NavLink>

            {isAuthenticated ? (
              <>
                {/* Only show Dashboard link for authors and admins */}
                {user?.role !== Role.USER && (
                  <NavLink
                    to="/dashboard"
                    active={location.pathname.startsWith("/dashboard")}
                  >
                    Dashboard
                  </NavLink>
                )}

                <button
                  onClick={logout}
                  className="text-white hover:text-pink-200 transition px-3 py-1 rounded hover:bg-indigo-700"
                >
                  Logout
                </button>
                <div className="flex items-center bg-indigo-700 bg-opacity-50 px-3 py-1 rounded">
                  <span className="font-medium">Hi, {user?.username}</span>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login" active={isActivePath("/login")}>
                  Login
                </NavLink>
                <NavLink to="/register" active={isActivePath("/register")}>
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-3 animate-slideInUp">
            <ul className="space-y-2">
              <li>
                <NavLink to="/" active={isActivePath("/")}>
                  Home
                </NavLink>
              </li>

              {isAuthenticated ? (
                <>
                  {user?.role !== Role.USER && (
                    <li>
                      <NavLink
                        to="/dashboard"
                        active={location.pathname.startsWith("/dashboard")}
                      >
                        Dashboard
                      </NavLink>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={logout}
                      className="w-full text-left text-white hover:text-pink-200 transition py-2"
                    >
                      Logout
                    </button>
                  </li>
                  <li className="py-2 text-indigo-200">Hi, {user?.username}</li>
                </>
              ) : (
                <>
                  <li>
                    <NavLink to="/login" active={isActivePath("/login")}>
                      Login
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/register" active={isActivePath("/register")}>
                      Register
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children }) => {
  return (
    <Link
      to={to}
      className={`transition-all duration-200 px-3 py-1 rounded ${
        active
          ? "bg-white text-indigo-700 font-medium"
          : "text-white hover:text-pink-200 hover:bg-indigo-700"
      }`}
    >
      {children}
    </Link>
  );
};

export default Header;
