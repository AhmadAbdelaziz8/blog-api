import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { Role } from "../types/index";
import Layout from "../components/Layout";

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

const AuthPage: React.FC = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === "/login");
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { notify } = useNotification();

  // Update isLogin state when location changes and update URL
  useEffect(() => {
    setIsLogin(location.pathname === "/login");
    // Update URL based on current mode without full navigation
    const newPath = isLogin ? "/login" : "/register";
    if (location.pathname !== newPath) {
      window.history.pushState({}, "", newPath);
    }
  }, [location.pathname, isLogin]);

  // Login state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Register state
  const [registerData, setRegisterData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: Role.USER,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<boolean>(false);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setServerError(false);

    try {
      setLoading(true);
      await login(loginData);
      notify.success("Login successful!");
      navigate("/");
    } catch (err: unknown) {
      console.error("Login error:", err);

      const error = err as ApiError;

      // Check if it's a connection error
      if (
        error.message &&
        error.message.includes("Unable to connect to the server")
      ) {
        setServerError(true);
        setError(
          "The server is currently unavailable. Please try again later or contact support if the issue persists."
        );
        notify.error("Server connection error");
      } else {
        setError(
          error.response?.data?.message ||
            "Invalid credentials. Please try again."
        );
        notify.error("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setServerError(false);

    // Validate form
    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      notify.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      // Create registration data without the confirmPassword field
      const registrationData = {
        email: registerData.email,
        username: registerData.username,
        password: registerData.password,
        role: registerData.role,
      };

      await register(registrationData);
      notify.success("Registration successful! Welcome to our blog platform.");
      navigate("/");
    } catch (err: unknown) {
      console.error("Registration error:", err);

      const error = err as ApiError;

      // Check if it's a connection error
      if (
        error.message &&
        error.message.includes("Unable to connect to the server")
      ) {
        setServerError(true);
        setError(
          "The server is currently unavailable. Please try again later or contact support if the issue persists."
        );
        notify.error("Server connection error");
      } else {
        setError(
          error.response?.data?.message ||
            "Registration failed. Please try again."
        );
        notify.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setServerError(false);
    // Update URL based on new mode
    navigate(isLogin ? "/register" : "/login", { replace: true });
  };

  const handleTryAgain = () => {
    window.location.reload();
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto py-12 px-4 sm:px-0">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500">
          <div className="relative">
            {/* Toggle Tabs */}
            <div className="flex border-b">
              <button
                className={`w-1/2 py-4 text-center font-medium text-lg transition-colors duration-300 ${
                  isLogin
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setIsLogin(true)}
                type="button"
              >
                Login
              </button>
              <button
                className={`w-1/2 py-4 text-center font-medium text-lg transition-colors duration-300 ${
                  !isLogin
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setIsLogin(false)}
                type="button"
              >
                Register
              </button>
            </div>

            {/* Sliding indicator */}
            <div
              className="absolute bottom-0 left-0 h-0.5 bg-indigo-600 transition-all duration-500 ease-in-out"
              style={{
                width: "50%",
                transform: isLogin ? "translateX(0)" : "translateX(100%)",
              }}
            ></div>
          </div>

          <div className="p-6 md:p-8">
            {serverError ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg mb-6 animate-fadeIn">
                <p className="font-medium mb-2">{error}</p>
                <div className="flex space-x-3 mt-2">
                  <button
                    onClick={handleTryAgain}
                    className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 animate-fadeIn">
                {error}
              </div>
            ) : null}

            <div className="relative overflow-hidden w-full">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: isLogin ? "translateX(0)" : "translateX(-50%)",
                  width: "200%",
                  minHeight: isLogin ? "auto" : "450px",
                }}
              >
                {/* Login Form - More compact */}
                <div className="w-1/2 flex-shrink-0">
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="animate-fadeIn">
                      <label
                        htmlFor="login-email"
                        className="block text-gray-700 font-medium mb-1.5"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="login-email"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        required
                      />
                    </div>

                    <div
                      className="animate-fadeIn"
                      style={{ animationDelay: "100ms" }}
                    >
                      <label
                        htmlFor="login-password"
                        className="block text-gray-700 font-medium mb-1.5"
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        id="login-password"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        required
                      />
                    </div>

                    <div
                      className="animate-fadeIn pt-2"
                      style={{ animationDelay: "200ms" }}
                    >
                      <button
                        type="submit"
                        disabled={loading || serverError}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md transition disabled:opacity-70"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Logging in...
                          </span>
                        ) : (
                          "Login"
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Register Form */}
                <div className="w-1/2 flex-shrink-0">
                  <form onSubmit={handleRegisterSubmit} className="space-y-5">
                    <div className="animate-fadeIn">
                      <label
                        htmlFor="register-email"
                        className="block text-gray-700 font-medium mb-2"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="register-email"
                        name="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        required
                      />
                    </div>

                    <div
                      className="animate-fadeIn"
                      style={{ animationDelay: "100ms" }}
                    >
                      <label
                        htmlFor="register-username"
                        className="block text-gray-700 font-medium mb-2"
                      >
                        Username
                      </label>
                      <input
                        type="text"
                        id="register-username"
                        name="username"
                        value={registerData.username}
                        onChange={handleRegisterChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        minLength={3}
                        required
                      />
                    </div>

                    <div
                      className="animate-fadeIn"
                      style={{ animationDelay: "150ms" }}
                    >
                      <label
                        htmlFor="register-role"
                        className="block text-gray-700 font-medium mb-2"
                      >
                        Role
                      </label>
                      <select
                        id="register-role"
                        name="role"
                        value={registerData.role}
                        onChange={handleRegisterChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      >
                        <option value={Role.USER}>User (Comment Only)</option>
                        <option value={Role.AUTHOR}>
                          Author (Create and Manage Posts)
                        </option>
                      </select>
                    </div>

                    <div
                      className="animate-fadeIn"
                      style={{ animationDelay: "200ms" }}
                    >
                      <label
                        htmlFor="register-password"
                        className="block text-gray-700 font-medium mb-2"
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        id="register-password"
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        minLength={6}
                        required
                      />
                    </div>

                    <div
                      className="animate-fadeIn"
                      style={{ animationDelay: "250ms" }}
                    >
                      <label
                        htmlFor="register-confirm-password"
                        className="block text-gray-700 font-medium mb-2"
                      >
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="register-confirm-password"
                        name="confirmPassword"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        required
                      />
                    </div>

                    <div
                      className="animate-fadeIn"
                      style={{ animationDelay: "300ms" }}
                    >
                      <button
                        type="submit"
                        disabled={loading || serverError}
                        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md transition disabled:opacity-70"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Registering...
                          </span>
                        ) : (
                          "Register"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-gray-600">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  onClick={toggleAuthMode}
                  className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
                >
                  {isLogin ? "Register here" : "Login here"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
