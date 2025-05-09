import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PostsService, CommentsService } from "../api";
import type { Post, Comment } from "../types/index";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

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
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;

    try {
      setCommentLoading(true);
      const addedComment = await CommentsService.createComment(id, newComment);
      setComments((prevComments) => [addedComment, ...prevComments]);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add comment. Please try again.");
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
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment. Please try again.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8">
          <p className="text-center">Loading post...</p>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
            {error || "Post not found"}
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Home
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <button
          onClick={() => navigate("/")}
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Home
        </button>

        <article className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="text-gray-500 mb-6">
            By {post.author?.username} •{" "}
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
          <div className="prose max-w-none">
            {post.content.split("\n").map((paragraph, i) => (
              <p key={i} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        <div className="border-t pt-6 mt-8">
          <h2 className="text-2xl font-bold mb-6">
            Comments ({comments.length})
          </h2>

          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="mb-4">
                <label htmlFor="comment" className="block text-gray-700 mb-2">
                  Add a Comment
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Join the discussion..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={commentLoading || !newComment.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {commentLoading ? "Posting..." : "Post Comment"}
              </button>
            </form>
          ) : (
            <div className="bg-gray-50 border rounded p-4 mb-8">
              <p>
                Please{" "}
                <a href="/login" className="text-blue-600 hover:text-blue-800">
                  log in
                </a>{" "}
                to add a comment.
              </p>
            </div>
          )}

          {comments.length === 0 ? (
            <p className="text-gray-500 py-4">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4">
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">
                      {comment.author?.username}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="mb-3">{comment.content}</p>

                  {isAuthenticated &&
                    (user?.id === comment.authorId ||
                      user?.id === post.authorId ||
                      user?.role === "ADMIN") && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 text-sm hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    )}
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
