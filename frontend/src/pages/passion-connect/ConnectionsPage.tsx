import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiUser, FiMessageCircle, FiHeart } from "react-icons/fi";
import { connectService } from "../../services/connectService";
import type { Connection } from "@/shared/types";
import toast from "react-hot-toast";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const data = await connectService.getConnections();
      setConnections(data);
    } catch (error: any) {
      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-pink"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 text-gradient-pink">
          Connections
        </h1>
        <p className="text-gray-400">View your mutual connections</p>
      </motion.div>

      {/* Connections Grid */}
      {connections.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {connections.map((connection) => {
            const connectedAt = connection.connectedAt
              ? new Date(connection.connectedAt).toLocaleDateString()
              : "Recently";
            const otherName = connection.otherUser?.fullName || "Match";
            const chatId = connection.chatId;

            return (
              <motion.div
                key={connection.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative bg-accent-white/50 backdrop-blur-sm rounded-xl p-6 border border-accent-white hover:border-primary-pink transition-all group"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-pink flex items-center justify-center">
                    <FiHeart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{otherName}</div>
                    <div className="text-sm text-gray-400">
                      Connected {connectedAt}
                    </div>
                  </div>
                </div>

                <div className="w-full h-48 rounded-lg bg-primary-pink/20 flex items-center justify-center mb-4 group-hover:bg-primary-pink/30 transition-colors">
                  {connection.otherUser?.avatarUrl ? (
                    <img
                      src={connection.otherUser.avatarUrl}
                      alt={otherName}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <FiUser className="w-20 h-20 text-primary-pink/40" />
                  )}
                </div>

                {chatId ? (
                  <Link
                    to={`/passion-connect/chat/${chatId}`}
                    className="flex w-full px-4 py-3 bg-gradient-pink text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-pink/50 transition-all text-center items-center justify-center space-x-2 mb-2"
                  >
                    <FiMessageCircle className="w-5 h-5" />
                    <span>Start Chatting</span>
                  </Link>
                ) : (
                  <p className="text-sm text-gray-400 text-center mb-2">
                    Chat unavailable
                  </p>
                )}

                <button className="w-full px-4 py-3 bg-accent-white/50 text-white rounded-lg hover:bg-accent-white transition-colors">
                  View Profile
                </button>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-pink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-accent-white/50 backdrop-blur-sm rounded-xl p-12 border border-accent-white"
        >
          <FiHeart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Connections Yet</h2>
          <p className="text-gray-400 mb-6">
            Start discovering profiles to find your match!
          </p>
          <Link
            to="/passion-connect/discover"
            className="inline-block px-6 py-3 bg-gradient-pink text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-pink/50 transition-all"
          >
            Discover Profiles
          </Link>
        </motion.div>
      )}
    </div>
  );
}
