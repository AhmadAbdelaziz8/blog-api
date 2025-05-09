import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { PostsService } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import Layout from "../components/Layout";

const PostFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { notify } = useNotification();
  const isEditMode = !!id;
  const editorRef = useRef<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    published: false,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(isEditMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated or not an author
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Allow only AUTHORS and ADMINS to create/edit posts
    if (user?.role === "USER") {
      navigate("/");
      return;
    }

    // If editing, fetch the post data
    if (isEditMode && id) {
      const fetchPost = async () => {
        try {
          setFetchLoading(true);
          const post = await PostsService.getPostById(id);

          // Ensure user is the author of the post they're trying to edit
          if (post.authorId !== user?.id && user?.role !== "ADMIN") {
            setError("You do not have permission to edit this post");
            return;
          }

          setFormData({
            title: post.title,
            content: post.content,
            published: post.published,
          });
          setError(null);
        } catch (err) {
          console.error("Error fetching post for editing:", err);
          setError(
            "Failed to load post data. The post may have been deleted or you do not have permission to edit it."
          );
        } finally {
          setFetchLoading(false);
        }
      };

      fetchPost();
    }
  }, [id, isEditMode, isAuthenticated, user, navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      // Get content directly from state
      if (isEditMode && id) {
        await PostsService.updatePost(id, formData);
        notify.success("Post updated successfully!");
      } else {
        await PostsService.createPost(formData);
        notify.success("Post created successfully!");
      }

      // Redirect to the dashboard after successful submit
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Error saving post:", err);
      setError(
        err.response?.data?.message || "Failed to save post. Please try again."
      );
      notify.error("Failed to save post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8">
          <p className="text-center">Loading post data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">
          {isEditMode ? "Edit Post" : "Create New Post"}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-gray-700 mb-2">
              Content
            </label>
            <Editor
              apiKey="no-api-key" // Using local mode, no API key required
              onInit={(evt, editor) => (editorRef.current = editor)}
              initialValue={formData.content}
              value={formData.content}
              onEditorChange={handleEditorChange}
              init={{
                height: 500,
                menubar: true,
                plugins: [
                  "advlist autolink lists link image charmap print preview anchor",
                  "searchreplace visualblocks code fullscreen",
                  "insertdatetime media table paste code help wordcount",
                ],
                toolbar:
                  "undo redo | formatselect | bold italic backcolor | \
                  alignleft aligncenter alignright alignjustify | \
                  bullist numlist outdent indent | removeformat | help",
                content_style:
                  "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              }}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-gray-700">
              Publish immediately
            </label>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEditMode
                ? "Update Post"
                : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PostFormPage;
