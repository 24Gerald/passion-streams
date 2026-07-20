import { MaritalStatus, UserRole } from "../shared/types";
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { getFirebaseAdmin } from "../config/firebase";
import { UserModel } from "../models/user.model";
import { AGE_LIMITS } from "../shared/constants";
import { comparePassword, generateToken, hashPassword } from "../utils/auth";
import { AuthRequest } from "../middleware/auth.middleware";

function sanitizeUser(user: any) {
  const obj = user.toJSON ? user.toJSON() : { ...user };
  delete obj.password;
  if (obj.id && !obj._id) obj._id = obj.id;
  return obj;
}

// Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

// Signup payload shape
interface SignupData {
  fullName: string;
  email: string;
  password: string;
  age: number;
  location: { country: string; city: string };
  maritalStatus: MaritalStatus;
}

// Email/password signup
export const signup = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      password,
      age,
      location,
      maritalStatus,
    }: SignupData = req.body;

    // Basic validation
    if (
      !fullName ||
      !email ||
      !password ||
      !age ||
      !location ||
      !maritalStatus
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (age < AGE_LIMITS.MIN_AGE) {
      return res
        .status(400)
        .json({ message: `Must be at least ${AGE_LIMITS.MIN_AGE} years old` });
    }

    // Prevent duplicate accounts
    const existingUser = await UserModel.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // Store hashed password
    const hashedPassword = await hashPassword(password);

    const user = await UserModel.create({
      fullName,
      email,
      password: hashedPassword,
      age,
      location,
      maritalStatus,
      role: UserRole.USER,
    });

    // Issue JWT
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
    });

    res.status(201).json({ user: sanitizeUser(user), token });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// Email/password login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await UserModel.findOne({ email });
    if (!user || !user.password)
      return res.status(401).json({ message: "Invalid credentials" });

    const isValid = await comparePassword(password, user.password);
    if (!isValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
    });

    res.json({ user: sanitizeUser(user), token });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Google sign-in using ID token
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken)
      return res.status(400).json({ message: "ID token is required" });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email)
      return res.status(400).json({ message: "Email not provided by Google" });

    const user = await UserModel.findOne({ email: payload.email });
    if (!user) {
      return res.status(400).json({
        message: "Please sign up first with email/password",
        requiresSignup: true,
      });
    }

    // Update profile image if available
    user.avatarUrl = payload.picture || user.avatarUrl;
    await user.save();

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
    });

    res.json({ user: sanitizeUser(user), token });
  } catch (error: any) {
    console.error("Google login error:", error);
    res
      .status(500)
      .json({ message: "Google login failed", error: error.message });
  }
};

// Apple sign-in via Firebase token verification
export const appleLogin = async (req: Request, res: Response) => {
  try {
    const { idToken, user: appleUser } = req.body;
    if (!idToken)
      return res.status(400).json({ message: "ID token is required" });

    const admin = getFirebaseAdmin();
    if (!admin) {
      return res.status(503).json({ message: "Apple sign-in is not configured" });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch {
      return res.status(401).json({ message: "Invalid Apple token" });
    }

    const email = decodedToken.email || appleUser?.email;
    if (!email)
      return res.status(400).json({ message: "Email not provided by Apple" });

    const user = await UserModel.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ message: "Please sign up first", requiresSignup: true });

    user.avatarUrl = user.avatarUrl || appleUser?.avatarUrl;
    await user.save();

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
    });

    res.json({ user: sanitizeUser(user), token });
  } catch (error: any) {
    console.error("Apple login error:", error);
    res
      .status(500)
      .json({ message: "Apple login failed", error: error.message });
  }
};

// Logout (JWT is stateless)
export const logout = async (_req: AuthRequest, res: Response) => {
  res.json({ message: "Logged out successfully" });
};

// Return authenticated user
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    res.json(sanitizeUser(req.user));
  } catch (error: any) {
    console.error("Get current user error:", error);
    res
      .status(500)
      .json({ message: "Failed to get current user", error: error.message });
  }
};

// Admin login — must be a user with role ADMIN
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await UserModel.findOne({ email, role: UserRole.ADMIN });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
    });

    res.json({ user: sanitizeUser(user), token });
  } catch (error: any) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Admin login failed", error: error.message });
  }
};
