import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PostsService } from "../api";
import type { Post } from "../types/index";
import Layout from "../components/Layout";
import { Role } from "../types";

// Helper function to strip HTML tags for preview
const stripHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

// Format date to more readable version
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Mock data for when backend is unavailable
const MOCK_POSTS: Post[] = [
  {
    id: "mock-1",
    title: "Welcome to the Blog Platform",
    content: "<p>This is a demo post shown when the backend server is unavailable. Please start the backend server to see actual content.</p><p>The blog platform allows you to read and write interesting articles on various topics.</p>",
    published: true,
    authorId: "mock-author-1",
    author: {
      id: "mock-author-1",
      email: "demo@example.com",
      username: "Demo User",
      role: Role.AUTHOR,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: {
      comments: 0
    }
  },
  {
    id: "mock-2",
    title: "Getting Started with the Blog Platform",
    content: "<p>This mock post provides information about how to use the blog platform. To see real content, please make sure the backend server is running.</p><p>You can register as an author to create your own posts or as a regular user to comment on posts.</p>",
    published: true,
    authorId: "mock-author-1",
    author: {
      id: "mock-author-1",
      email: "demo@example.com",
      username: "Demo User",
      role: Role.AUTHOR,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: {
      comments: 0
    }
  }
];

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState<boolean>(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await PostsService.getAllPosts();
        setPosts(data);
        setError(null);
        setIsUsingMockData(false);
      } catch (err: any) {
        console.error("Error fetching posts:", err);
        
        // Check if it's a connection error
        if (err.message && err.message.includes("Unable to connect to the server")) {
          console.log("Using mock data due to server connection issue");
          setPosts(MOCK_POSTS);
          setIsUsingMockData(true);
          setError("Using demo content. Backend server is not running.");
        } else {
          setError("Failed to load posts. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-indigo-700">
            Welcome to <span className="text-pink-500">BlogPlatform</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover inspiring stories, insightful articles, and engaging
            discussions from our community of writers.
          </p>
        </header>

        {isUsingMockData && (
          <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg">
            <p className="font-medium">
              {error} 
              <a 
                href="#" 
                onClick={() => window.location.reload()} 
                className="underline ml-1 hover:text-amber-900"
              >
                Refresh to try again
              </a>
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-indigo-300 h-12 w-12 mb-4"></div>
              <div className="text-indigo-500 text-lg">Loading posts...</div>
            </div>
          </div>
        ) : error && !isUsingMockData ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
            <p className="font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-600 mb-3">
              No posts yet
            </h2>
            <p className="text-gray-500 mb-8">
              Be the first to share your thoughts!
            </p>
            <Link
              to="/register"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Join Now & Start Writing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover-scale animate-fadeIn`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <Link to={`/posts/${post.id}`} className="block mb-3 group">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition">
                      {post.title}
                    </h2>
                  </Link>

                  <div className="flex items-center mb-4 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">
                      {post.author?.username}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>

                  <div className="mb-4 text-gray-600 h-24 overflow-hidden">
                    {(() => {
                      const plainText = stripHtml(post.content);
                      return plainText.length > 150
                        ? `${plainText.substring(0, 150)}...`
                        : plainText;
                    })()}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <Link
                      to={`/posts/${post.id}`}
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition"
                    >
                      Read more
                      <svg
                        className="ml-1 w-5 h-5 transform group-hover:translate-x-1 transition"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </Link>

                    <span className="flex items-center text-gray-500 text-sm">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                      {post._count?.comments || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
