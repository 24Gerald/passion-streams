import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { ChatModel } from "../models/chat.model";
import { UserModel } from "../models/user.model";

// Create a new chat thread
export const createChat = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    const { type = "USER_ADMIN", module } = req.body;

    if (type === "USER_ADMIN") {
      const existing = await ChatModel.findOne({
        type: "USER_ADMIN",
        module,
        participants: req.user._id,
      });

      if (existing) {
        return res.status(201).json(existing);
      }

      const chat = await ChatModel.create({
        participants: [req.user._id],
        type: "USER_ADMIN",
        module,
        messages: [],
        lastActivityAt: new Date(),
      });

      return res.status(201).json(chat);
    }

    return res.status(400).json({ message: "Unsupported chat type" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to create chat", error: error.message });
  }
};

// Fetch chats for the authenticated user
export const getChats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    const chats = await ChatModel.find({
      participants: req.user._id,
    })
      .sort({ lastActivityAt: -1 })
      .limit(50)
      .populate("participants", "fullName email")
      .populate("adminId", "fullName email")
      .lean();

    res.json(chats);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch chats", error: error.message });
  }
};

// Fetch messages for a specific chat
export const getChatMessages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    const { id: chatId } = req.params;

    const chat = await ChatModel.findById(chatId)
      .populate("messages.senderId", "fullName email")
      .lean();

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Ensure user is a participant
    if (!chat.participants.map(String).includes(req.user._id.toString()))
      return res.status(403).json({ message: "Access denied" });

    res.json(
      chat.messages.map((msg: any) => ({
        ...msg.toJSON?.() ?? msg,
        id: msg._id?.toString() || msg.id,
        chatId,
      })),
    );
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch messages", error: error.message });
  }
};

// Send a new message in a chat
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    const { id: chatId } = req.params;
    const { content, type = "TEXT" } = req.body;

    if (!content)
      return res.status(400).json({ message: "Message content is required" });

    const chat = await ChatModel.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Ensure user is a participant
    if (!chat.participants.map(String).includes(req.user._id.toString()))
      return res.status(403).json({ message: "Access denied" });

    const message = {
      senderId: req.user._id as any,
      content,
      type,
      createdAt: new Date(),
    };

    chat.messages.push(message);
    chat.lastMessage = message;
    chat.lastActivityAt = new Date();
    await chat.save();

    res.status(201).json({
      ...message,
      id: chat.messages[chat.messages.length - 1]._id?.toString(),
      chatId,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to send message", error: error.message });
  }
};

// Invite an admin into an active chat
export const inviteAdmin = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    const { id: chatId } = req.params;

    const chat = await ChatModel.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const admin = await UserModel.findOne({ role: "ADMIN" });
    if (!admin) return res.status(404).json({ message: "No admin available" });

    // Add admin if not already present
    if (!chat.participants.map(String).includes(admin._id.toString())) {
      chat.adminId = admin._id;
      chat.participants.push(admin._id);
      chat.isAdminActive = true;
      chat.adminExitsAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await chat.save();
    }

    res.json({ message: "Admin invited to chat" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to invite admin", error: error.message });
  }
};
