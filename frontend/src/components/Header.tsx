import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Role } from "../types";

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Blog Platform
        </Link>

        <nav className="flex gap-4">
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>

          {isAuthenticated ? (
            <>
              {/* Only show Dashboard link for authors and admins */}
              {user?.role !== Role.USER && (
                <Link to="/dashboard" className="hover:text-gray-300">
                  Dashboard
                </Link>
              )}

              <button onClick={logout} className="hover:text-gray-300">
                Logout
              </button>
              <span className="opacity-75">Hi, {user?.username}</span>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300">
                Login
              </Link>
              <Link to="/register" className="hover:text-gray-300">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
