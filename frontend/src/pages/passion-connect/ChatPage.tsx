import type { ChatMessage } from "@/shared/types";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiSend,
  FiUser,
  // FiMessageCircle,
  FiUserCheck,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../../hooks/useSocket";
import { chatService } from "../../services/chatService";
import {
  emitTyping,
  joinChat,
  leaveChat,
  onNewMessage,
  sendSocketMessage,
} from "../../services/socketService";
import { useAuthStore } from "../../store/authStore";

export default function ChatPage() {
  const { chatId: paramChatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuthStore();
  const socket = useSocket();

  const chatId = paramChatId || null;

  console.log(setTypingUsers);

  useEffect(() => {
    if (chatId) {
      initializeChat();
    }
  }, [chatId]);

  useEffect(() => {
    if (socket && chatId) {
      joinChat(chatId);

      const unsubscribe = onNewMessage((message) => {
        if (message.chatId === chatId) {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
        }
      });

      return () => {
        unsubscribe();
        if (chatId) leaveChat(chatId);
      };
    }
  }, [socket, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    if (!chatId) return;

    try {
      setLoading(true);
      const messagesData = await chatService.getMessages(chatId);
      setMessages(messagesData);
    } catch (error: any) {
      toast.error("Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (socket && chatId) emitTyping(chatId, false);

    try {
      if (socket) {
        sendSocketMessage(chatId, messageContent);
      } else {
        const message = await chatService.sendMessage(chatId, messageContent);
        setMessages((prev) => [...prev, message]);
      }
    } catch (error: any) {
      toast.error("Failed to send message");
      setNewMessage(messageContent);
    }
  };

  const handleInviteAdmin = async () => {
    if (!chatId) return;

    try {
      await chatService.inviteAdmin(chatId);
      toast.success("Admin has been invited to the chat");
    } catch (error: any) {
      toast.error("Failed to invite admin");
    }
  };

  if (!chatId) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-400">
          Please select a connection to start chatting
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-pink"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-accent-white/50 backdrop-blur-sm rounded-t-xl p-4 border-b border-accent-white flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/passion-connect/connections")}
            className="p-2 hover:bg-accent-white rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-pink flex items-center justify-center text-white">
            <FiUser className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold">Your Match</div>
            <div className="text-sm text-gray-400">
              {typingUsers.size > 0 ? "typing..." : "Online"}
            </div>
          </div>
        </div>
        <button
          onClick={handleInviteAdmin}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-pink text-white rounded-lg hover:shadow-lg hover:shadow-primary-pink/50 transition-all text-sm"
        >
          <FiUserCheck className="w-4 h-4" />
          <span>Invite Admin</span>
        </button>
      </motion.div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background">
        <AnimatePresence>
          {messages.map((message, index) => {
            const isOwn =
              message.senderId === user?._id ||
              message.senderId === (user as any)?.id;
            const isNewDay =
              index === 0 ||
              new Date(message.createdAt).toDateString() !==
                new Date(messages[index - 1].createdAt).toDateString();

            return (
              <div key={message.id}>
                {isNewDay && (
                  <div className="text-center text-gray-500 text-sm my-4">
                    {format(new Date(message.createdAt), "MMMM d, yyyy")}
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isOwn
                        ? "bg-gradient-pink text-white"
                        : "bg-accent-white/50 text-gray-300"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <div
                      className={`text-xs mt-1 ${isOwn ? "text-white/70" : "text-gray-500"}`}
                    >
                      {format(new Date(message.createdAt), "h:mm a")}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-accent-white/50 backdrop-blur-sm rounded-b-xl p-4 border-t border-accent-white">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-background border border-accent-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-pink"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-gradient-pink text-white rounded-lg hover:shadow-lg hover:shadow-primary-pink/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
