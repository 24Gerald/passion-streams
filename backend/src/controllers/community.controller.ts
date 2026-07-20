import { Response } from "express";
import { Types } from "mongoose";
import { AuthRequest } from "../middleware/auth.middleware";
import { CommunityPostModel } from "../models/communitypost.model";
import { CommentModel } from "../models/comment.model";

// Fetch community posts with role-based filtering
export const getPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { module, status } = req.query;
    const filter: any = {};

    if (module) filter.module = module;

    // Non-admins only see approved posts
    if (!req.user || req.user.role !== "ADMIN") {
      filter.status = "APPROVED";
    } else if (status) {
      filter.status = status;
    }

    const posts = await CommunityPostModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("userId", "fullName avatarUrl");

    res.json(posts);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch posts", error: error.message });
  }
};

// Create a new community post (defaults to pending)
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    const { content, module } = req.body;
    if (!content || !module)
      return res
        .status(400)
        .json({ message: "Content and module are required" });

    const post = await CommunityPostModel.create({
      userId: req.user._id,
      content,
      module,
      status: "PENDING",
      likes: [],
    });

    res.status(201).json(post);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to create post", error: error.message });
  }
};

// Fetch a single post by ID
export const getPostById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid post ID" });

    const post = await CommunityPostModel.findById(id).populate(
      "userId",
      "fullName avatarUrl",
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch post", error: error.message });
  }
};

// Like or unlike a post
export const likePost = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    const { id } = req.params;

    if (!Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid post ID" });

    const post = await CommunityPostModel.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = new Types.ObjectId(req.user._id);
    const isLiked = post.likes.some((like: Types.ObjectId) =>
      like.equals(userId),
    );

    if (isLiked) {
      post.likes = post.likes.filter(
        (like: Types.ObjectId) => !like.equals(userId),
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ message: isLiked ? "Post unliked" : "Post liked" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to like post", error: error.message });
  }
};

// Fetch approved comments for a post
export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const { id: postId } = req.params;

    const comments = await CommentModel.find({
      postId,
      status: "APPROVED",
    }).sort({ createdAt: 1 });

    res.json(comments);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch comments", error: error.message });
  }
};

// Create a new comment (defaults to pending)
export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    const { id: postId } = req.params;
    const { content } = req.body;

    if (!content)
      return res.status(400).json({ message: "Content is required" });

    const comment = await CommentModel.create({
      postId,
      userId: req.user._id,
      content,
      status: "APPROVED",
    });

    res.status(201).json(comment);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to create comment", error: error.message });
  }
};
