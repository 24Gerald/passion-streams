import { Schema, model, Document, Types } from "mongoose";

// Represents a mutual connection between two users
export interface IConnection extends Document {
  user1Id: Types.ObjectId; // First user in the connection
  user2Id: Types.ObjectId; // Second user in the connection
  status: "CONNECTED"; // Current connection status
  chatId?: Types.ObjectId; // Chat thread for this connection
  createdAt: Date; // When document was created
  connectedAt: Date; // When users became connected
}

// Mongoose schema
const ConnectionSchema = new Schema<IConnection>(
  {
    user1Id: { type: Schema.Types.ObjectId, ref: "User", required: true }, // First user
    user2Id: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Second user
    status: { type: String, enum: ["CONNECTED"], default: "CONNECTED" }, // Always connected
    chatId: { type: Schema.Types.ObjectId, ref: "Chat" },
    connectedAt: { type: Date, default: Date.now }, // Timestamp of connection
  },
  { timestamps: true }, // Auto-manages createdAt & updatedAt
);

// Export model
export const ConnectionModel = model<IConnection>(
  "Connection",
  ConnectionSchema,
);
