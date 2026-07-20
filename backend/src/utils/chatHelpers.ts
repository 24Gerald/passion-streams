import { Types } from "mongoose";
import { ChatModel } from "../models/chat.model";

export async function findOrCreateConnectChat(
  user1Id: Types.ObjectId | string,
  user2Id: Types.ObjectId | string,
) {
  const participants = [
    new Types.ObjectId(user1Id),
    new Types.ObjectId(user2Id),
  ];

  const existing = await ChatModel.findOne({
    type: "CONNECT_CHAT",
    participants: { $all: participants },
  });

  if (existing) return existing;

  return ChatModel.create({
    participants,
    type: "CONNECT_CHAT",
    messages: [],
    lastActivityAt: new Date(),
  });
}
