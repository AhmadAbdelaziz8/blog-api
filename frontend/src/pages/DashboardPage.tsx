import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PostsService } from "../api";
import type { Post } from "../types/index";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated or not an author
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Allow only AUTHORS and ADMINS to access the dashboard
    if (user?.role === "USER") {
      navigate("/");
      return;
    }

    const fetchAuthorPosts = async () => {
      try {
        setLoading(true);
        const data = await PostsService.getAuthorPosts();
        setPosts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching author posts:", err);
        setError("Failed to load your posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorPosts();
  }, [isAuthenticated, user, navigate]);

  const handleTogglePublish = async (postId: string) => {
    try {
      const updatedPost = await PostsService.togglePublishStatus(postId);
      // Update the post in the posts array
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, published: updatedPost.published }
            : post
        )
      );
    } catch (err) {
      console.error("Error toggling publish status:", err);
      alert("Failed to update publish status. Please try again.");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await PostsService.deletePost(postId);
      // Remove the post from the posts array
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete the post. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Author Dashboard</h1>
          <Link
            to="/dashboard/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create New Post
          </Link>
        </div>

        {loading ? (
          <p className="text-center py-8">Loading your posts...</p>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="mb-4">You haven't created any posts yet.</p>
            <Link
              to="/dashboard/new"
              className="text-blue-600 hover:text-blue-800"
            >
              Create your first post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        <Link
                          to={`/posts/${post.id}`}
                          className="hover:text-blue-600"
                        >
                          {post.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.published
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post._count?.comments || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/dashboard/edit/${post.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleTogglePublish(post.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {post.published ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
