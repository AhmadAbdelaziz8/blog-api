import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PostsService, CommentsService } from "../api";
import type { Post, Comment } from "../types/index";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import Layout from "../components/Layout";

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { notify } = useNotification();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const postData = await PostsService.getPostById(id);
        setPost(postData);

        // Post might already include comments, but we fetch them separately to ensure we have the latest
        const commentsData = await CommentsService.getPostComments(id);
        setComments(commentsData);

        setError(null);
      } catch (err) {
        console.error("Error fetching post details:", err);
        setError(
          "Failed to load post. It might have been removed or you may not have permission to view it."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();

    // Scroll to top when viewing a post
    window.scrollTo(0, 0);
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;

    try {
      setCommentLoading(true);
      const addedComment = await CommentsService.createComment(id, newComment);
      setComments((prevComments) => [addedComment, ...prevComments]);
      setNewComment("");
      notify.success("Comment added successfully!");
    } catch (err) {
      console.error("Error adding comment:", err);
      notify.error("Failed to add comment. Please try again.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await CommentsService.deleteComment(commentId);
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
      notify.success("Comment deleted successfully.");
    } catch (err) {
      console.error("Error deleting comment:", err);
      notify.error("Failed to delete comment. Please try again.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-600 text-lg">Loading post...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg mb-6 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error || "Post not found"}</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 animate-fadeIn">
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition mb-6"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </button>

          <article>
            <h1 className="text-4xl font-bold mb-4 text-gray-800">
              {post.title}
            </h1>
            <div className="flex items-center mb-8 text-gray-500">
              <span className="font-medium text-gray-700">
                By {post.author?.username}
              </span>
              <span className="mx-2">•</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>

            <div className="prose prose-lg max-w-none mb-12">
              <div
                className="post-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </article>
        </div>

        <div className="border-t border-gray-200 pt-10 mt-10" id="comments">
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            Comments{" "}
            <span className="ml-2 text-gray-500">({comments.length})</span>
          </h2>

          {isAuthenticated ? (
            <form
              onSubmit={handleCommentSubmit}
              className="mb-10 bg-gray-50 p-6 rounded-lg shadow-sm"
            >
              <div className="mb-4">
                <label
                  htmlFor="comment"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Join the conversation
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={commentLoading || !newComment.trim()}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commentLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Posting...
                  </span>
                ) : (
                  "Post Comment"
                )}
              </button>
            </form>
          ) : (
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-lg mb-10">
              <p className="text-indigo-800 mb-4">
                Join the conversation by logging in to your account.
              </p>
              <div className="flex space-x-4">
                <a
                  href="/login"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Log In
                </a>
                <a
                  href="/register"
                  className="px-5 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                >
                  Register
                </a>
              </div>
            </div>
          )}

          {comments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-2">
                No comments yet. Be the first to share your thoughts!
              </p>
              {!isAuthenticated && (
                <a
                  href="/login"
                  className="text-indigo-600 hover:text-indigo-800 transition"
                >
                  Log in to comment
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-b border-gray-200 pb-6 hover-scale"
                >
                  <div className="flex justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-600 font-medium mr-3">
                        {comment.author?.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {comment.author?.username}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {formatDate(comment.createdAt)}
                        </div>
                      </div>
                    </div>

                    {isAuthenticated &&
                      (user?.id === comment.authorId ||
                        user?.id === post.authorId ||
                        user?.role === "ADMIN") && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 hover:text-red-700 transition"
                          aria-label="Delete comment"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                  </div>
                  <div className="prose max-w-none">
                    <p>{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PostDetailPage;
