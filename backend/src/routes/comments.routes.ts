import express from "express";
import {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
  commentValidation,
} from "../controllers/comments.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

// Get comments for a specific post (public)
router.get("/post/:postId", getPostComments);

// Protected routes - require authentication
router.use(authenticate);

// Create a comment on a post
router.post("/post/:postId", commentValidation, createComment);

// Update a comment
router.put("/:id", commentValidation, updateComment);

// Delete a comment
router.delete("/:id", deleteComment);

export default router;
