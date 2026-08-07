import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { PassionConnectProfileModel } from "../models/passionConnectProfile.model";
import { SwipeModel } from "../models/swipe.model";
import { ConnectionModel } from "../models/connection.model";
import { findOrCreateConnectChat } from "../utils/chatHelpers";

// Fetch the authenticated user's profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    const profile = await PassionConnectProfileModel.findOne({
      userId: req.user._id,
    });

    res.json(profile);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch profile", error: error.message });
  }
};

// Create or update the user's profile
export const createOrUpdateProfile = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    const { bio, photos, interests, whatYouSeek, testimonial } = req.body;

    const profileData = {
      userId: req.user._id,
      bio,
      photos: photos || [],
      interests: interests || [],
      whatYouSeek,
      testimonial,
      isActive: true,
      updatedAt: new Date(),
    };

    const profile = await PassionConnectProfileModel.findOneAndUpdate(
      { userId: req.user._id },
      { $set: profileData },
      { new: true, upsert: true },
    );

    res.json(profile);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to save profile", error: error.message });
  }
};

// Discover other active profiles (excluding self and already swiped)
export const discover = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    const swiped = await SwipeModel.find({ userId: req.user._id }).select(
      "targetUserId",
    );
    const swipedIds = swiped.map((s) => s.targetUserId);

    const profiles = await PassionConnectProfileModel.find({
      isActive: true,
      userId: { $nin: [req.user._id, ...swipedIds] },
    }).populate("userId", "fullName age avatarUrl growthPercentage growthTier");

    const normalized = profiles.map((p) => {
      const json = p.toJSON() as any;
      if (json.userId && typeof json.userId === "object") {
        json.userId = json.userId.id || json.userId._id?.toString();
      }
      return json;
    });

    res.json(normalized);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to discover profiles", error: error.message });
  }
};

// Record a swipe and create a connection if mutual
export const swipe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    const { profileId, action } = req.body;
    if (!profileId || !action)
      return res
        .status(400)
        .json({ message: "Profile ID and action are required" });

    await SwipeModel.findOneAndUpdate(
      { userId: req.user._id, targetUserId: profileId },
      { action },
      { upsert: true, new: true },
    );

    if (action === "like") {
      const existingConnection = await ConnectionModel.findOne({
        $or: [
          { user1Id: req.user._id, user2Id: profileId },
          { user1Id: profileId, user2Id: req.user._id },
        ],
      });

      if (!existingConnection) {
        const mutualSwipe = await SwipeModel.findOne({
          userId: profileId,
          targetUserId: req.user._id,
          action: "like",
        });

        if (mutualSwipe) {
          const chat = await findOrCreateConnectChat(req.user._id, profileId);

          const connection = await ConnectionModel.create({
            user1Id: req.user._id,
            user2Id: profileId,
            status: "CONNECTED",
            chatId: chat._id,
          });

          return res.json({
            message: "It's a match!",
            connected: true,
            connection,
            chatId: chat._id,
          });
        }
      }
    }

    res.json({ message: "Swipe recorded", connected: false });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to swipe", error: error.message });
  }
};

// Fetch all active connections for the user
export const getConnections = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    const connections = await ConnectionModel.find({
      $or: [{ user1Id: req.user._id }, { user2Id: req.user._id }],
      status: "CONNECTED",
    })
      .populate("user1Id", "fullName avatarUrl age")
      .populate("user2Id", "fullName avatarUrl age")
      .populate("chatId");

    const enriched = connections.map((conn) => {
      const json = conn.toJSON() as any;
      const otherUser =
        json.user1Id?.id === req.user!._id.toString()
          ? json.user2Id
          : json.user1Id;
      return {
        ...json,
        otherUser,
        chatId: json.chatId?.id || json.chatId,
      };
    });

    res.json(enriched);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch connections", error: error.message });
  }
};
