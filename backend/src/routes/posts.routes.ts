import express from "express";
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getAuthorPosts,
  togglePublishStatus,
  postValidation,
} from "../controllers/posts.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const router = express.Router();

// Public routes
router.get("/", getAllPosts);
router.get("/:id", getPostById);

// Protected routes - require authentication
router.use(authenticate);

// Author-only routes
router.get("/author/dashboard", getAuthorPosts);
router.post("/", postValidation, createPost);
router.put("/:id", postValidation, updatePost);
router.delete("/:id", deletePost);
router.patch("/:id/publish", togglePublishStatus);

export default router;
