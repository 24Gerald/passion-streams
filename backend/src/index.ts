import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";

// MongoDB
import { connectMongoDB } from "./config/database";
import { seedIfEmpty } from "./utils/seedIfEmpty";

// Routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import contentRoutes from "./routes/content.routes";
import courseRoutes from "./routes/course.routes";
import communityRoutes from "./routes/community.routes";
import connectRoutes from "./routes/connect.routes";
import chatRoutes from "./routes/chat.routes";
import paymentRoutes from "./routes/payment.routes";
import adminRoutes from "./routes/admin.routes";
import partnershipRoutes from "./routes/partnership.routes";
import uploadRoutes from "./routes/upload.routes";

// Socket.io
import { initializeSocket } from "./config/socket";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

const io = initializeSocket(httpServer);
export { io };

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// Base route
app.get("/", (_req, res) => {
  res.json({
    name: "Passion Streams API",
    status: "running",
    version: "1.0.0",
  });
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/connect", connectRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/partnership", partnershipRoutes);
app.use("/api/upload", uploadRoutes);

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Bootstrap
const startServer = async () => {
  try {
    await connectMongoDB();
    await seedIfEmpty();

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
