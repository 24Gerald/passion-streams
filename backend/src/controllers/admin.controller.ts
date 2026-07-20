import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { UserModel } from "../models/user.model";
import { CommunityPostModel } from "../models/communitypost.model";
import { ContentModel } from "../models/content.model";

// Dashboard summary stats
export const getDashboard = async (_req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalPosts, pendingPosts] = await Promise.all([
      UserModel.countDocuments(),
      CommunityPostModel.countDocuments(),
      CommunityPostModel.countDocuments({ status: "PENDING" }),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalPosts,
        pendingPosts,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch dashboard",
      error: error.message,
    });
  }
};

// Fetch items awaiting moderation
export const getModerationQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { type = "posts" } = req.query;

    if (type === "posts") {
      const posts = await CommunityPostModel.find({ status: "PENDING" })
        .sort({ createdAt: -1 })
        .populate("userId", "fullName avatarUrl");

      return res.json({ posts, comments: [] });
    }

    // Comments support to be added later
    res.json({ posts: [], comments: [] });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch moderation queue",
      error: error.message,
    });
  }
};

// Approve a pending post
export const approvePost = async (req: AuthRequest, res: Response) => {
  await CommunityPostModel.findByIdAndUpdate(req.params.id, {
    status: "APPROVED",
    reviewedAt: new Date(),
    reviewedBy: req.user!._id,
  });

  res.json({ message: "Post approved" });
};

// Reject a post with a reason
export const rejectPost = async (req: AuthRequest, res: Response) => {
  await CommunityPostModel.findByIdAndUpdate(req.params.id, {
    status: "REJECTED",
    rejectionReason: req.body.reason,
    reviewedAt: new Date(),
    reviewedBy: req.user!._id,
  });

  res.json({ message: "Post rejected" });
};

// Create new content item
export const createContent = async (req: AuthRequest, res: Response) => {
  try {
    const contentData = {
      ...req.body,
      createdBy: req.user?._id,
    };

    const newContent = await ContentModel.create(contentData);

    res.status(201).json({
      id: newContent._id,
      ...newContent.toObject(),
    });
  } catch (error: any) {
    console.error("Create content error:", error);
    res.status(500).json({
      message: "Failed to create content",
      error: error.message,
    });
  }
};

// Update an existing content item
export const updateContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const updatedContent = await ContentModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }, // return updated document
    );

    if (!updatedContent) {
      return res.status(404).json({ message: "Content not found" });
    }

    res.json({
      id: updatedContent._id,
      ...updatedContent.toObject(),
    });
  } catch (error: any) {
    console.error("Update content error:", error);
    res.status(500).json({
      message: "Failed to update content",
      error: error.message,
    });
  }
};

// Delete a content item
export const deleteContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await ContentModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Content not found" });
    }

    res.json({ message: "Content deleted successfully" });
  } catch (error: any) {
    console.error("Delete content error:", error);
    res.status(500).json({
      message: "Failed to delete content",
      error: error.message,
    });
  }
};

// High-level platform analytics
export const getAnalytics = async (_req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalContents, totalPosts] = await Promise.all([
      UserModel.countDocuments(),
      ContentModel.countDocuments(),
      CommunityPostModel.countDocuments(),
    ]);

    // Aggregate total likes across posts
    const totalLikes = await CommunityPostModel.aggregate([
      { $project: { likesCount: { $size: "$likes" } } },
      { $group: { _id: null, totalLikes: { $sum: "$likesCount" } } },
    ]);

    res.json({
      users: totalUsers,
      contentItems: totalContents,
      posts: totalPosts,
      totalLikes: totalLikes[0]?.totalLikes || 0,
    });
  } catch (error: any) {
    console.error("Analytics error:", error);
    res.status(500).json({
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};
