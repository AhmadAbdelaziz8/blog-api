import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { body, validationResult } from "express-validator";

const prisma = new PrismaClient();

// Validation rules
export const postValidation = [
  body("title")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters"),
  body("content")
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters"),
];

// Get all published posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error while fetching posts" });
  }
};

// Get a single post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // For unpublished posts, only allow access to the author
    if (
      !post.published &&
      post.author.id !== req.user?.id &&
      req.user?.role !== "ADMIN"
    ) {
      return res
        .status(403)
        .json({ message: "You do not have permission to view this post" });
    }

    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server error while fetching post" });
  }
};

// Create a new post
export const createPost = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, published = false } = req.body;
    const authorId = req.user.id;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        published,
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

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error while creating post" });
  }
};

// Update a post
export const updatePost = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, content, published } = req.body;

    // Check if post exists and user is the author
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is authorized to update the post
    if (post.author.id !== req.user.id && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "You do not have permission to update this post" });
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        published,
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

    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Server error while updating post" });
  }
};

// Delete a post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if post exists and user is the author
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is authorized to delete the post
    if (post.author.id !== req.user.id && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this post" });
    }

    // Delete all comments associated with the post
    await prisma.comment.deleteMany({
      where: { postId: id },
    });

    // Delete the post
    await prisma.post.delete({
      where: { id },
    });

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error while deleting post" });
  }
};

// Get all posts (including unpublished) for the author dashboard
export const getAuthorPosts = async (req: Request, res: Response) => {
  try {
    const authorId = req.user.id;

    const posts = await prisma.post.findMany({
      where: { authorId },
      include: {
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching author posts:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching author posts" });
  }
};

// Toggle post publish status
export const togglePublishStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if post exists and user is the author
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is authorized to update the post
    if (post.author.id !== req.user.id && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "You do not have permission to update this post" });
    }

    // Toggle the published status
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        published: !post.published,
      },
    });

    res.json(updatedPost);
  } catch (error) {
    console.error("Error toggling publish status:", error);
    res
      .status(500)
      .json({ message: "Server error while toggling publish status" });
  }
};
