import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { body, validationResult } from "express-validator";

const prisma = new PrismaClient();

// Validation rules
export const commentValidation = [
  body("content")
    .isLength({ min: 3 })
    .withMessage("Comment must be at least 3 characters"),
];

// Create a new comment
export const createComment = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { postId } = req.params;
    const { content } = req.body;
    const authorId = req.user.id;

    // Check if post exists and is published
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only allow commenting on published posts, unless the user is the author or an admin
    if (
      !post.published &&
      post.authorId !== authorId &&
      req.user.role !== "ADMIN"
    ) {
      return res
        .status(403)
        .json({ message: "Cannot comment on unpublished posts" });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Server error while creating comment" });
  }
};

// Get all comments for a post
export const getPostComments = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // If post is not published, only author or admin can view comments
    if (!post.published) {
      // If not authenticated, deny access
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // If not the author or admin, deny access
      if (post.authorId !== req.user.id && req.user.role !== "ADMIN") {
        return res
          .status(403)
          .json({
            message: "You do not have permission to view these comments",
          });
      }
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error while fetching comments" });
  }
};

// Update a comment
export const updateComment = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { content } = req.body;

    // Check if comment exists and user is the author
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
          },
        },
        post: {
          select: {
            authorId: true,
          },
        },
      },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is authorized to update the comment
    // Allow the comment author, post author, and admins to update
    if (
      comment.author.id !== req.user.id &&
      comment.post.authorId !== req.user.id &&
      req.user.role !== "ADMIN"
    ) {
      return res
        .status(403)
        .json({ message: "You do not have permission to update this comment" });
    }

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Server error while updating comment" });
  }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
          },
        },
        post: {
          select: {
            authorId: true,
          },
        },
      },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is authorized to delete the comment
    // Allow the comment author, post author, and admins to delete
    if (
      comment.author.id !== req.user.id &&
      comment.post.authorId !== req.user.id &&
      req.user.role !== "ADMIN"
    ) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this comment" });
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id },
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Server error while deleting comment" });
  }
};
