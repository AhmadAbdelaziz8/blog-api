import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PostsService } from "../api";
import type { Post } from "../types/index";
import Layout from "../components/Layout";

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await PostsService.getAllPosts();
        setPosts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Latest Posts</h1>

        {loading ? (
          <p className="text-center py-8">Loading posts...</p>
        ) : error ? (
          <div className="text-red-500 py-4">{error}</div>
        ) : posts.length === 0 ? (
          <p className="text-center py-8">No posts yet. Check back later!</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border rounded-lg p-6 shadow-sm hover:shadow-md transition"
              >
                <h2 className="text-2xl font-semibold mb-2">
                  <Link
                    to={`/posts/${post.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-500 mb-3">
                  By {post.author?.username} •{" "}
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <p className="mb-4">
                  {post.content.length > 200
                    ? `${post.content.substring(0, 200)}...`
                    : post.content}
                </p>
                <div className="flex justify-between items-center">
                  <Link
                    to={`/posts/${post.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Read more →
                  </Link>
                  <span className="text-gray-500 text-sm">
                    {post._count?.comments} comment
                    {post._count?.comments !== 1 ? "s" : ""}
                  </span>
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
