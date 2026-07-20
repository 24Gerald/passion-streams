/**
 * Shared TypeScript types for PassionStreams
 */

export enum MaritalStatus {
  NOT_IN_RELATIONSHIP = "NOT_IN_RELATIONSHIP",
  IN_RELATIONSHIP = "IN_RELATIONSHIP",
  MARRIED = "MARRIED",
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum ModuleAccess {
  PASSION_SINGLES = "PASSION_SINGLES",
  PASSION_CONNECT = "PASSION_CONNECT",
  PASSION_COUPLES = "PASSION_COUPLES",
}

export enum ContentType {
  PDF = "PDF",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
  ARTICLE = "ARTICLE",
  ANNOUNCEMENT = "ANNOUNCEMENT",
  PRAYER_POINT = "PRAYER_POINT",
}

export enum CourseTier {
  ALL = "ALL",
  FREE = "FREE",
  PREMIUM = "PREMIUM",
}

export enum GrowthTier {
  TIER_1 = "TIER_1", // 0% completion
  TIER_2 = "TIER_2", // 1-99% completion
  TIER_3 = "TIER_3", // 100% completion
}

export enum PostStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
  PAST_DUE = "PAST_DUE",
  EXPIRED = "EXPIRED",
}

export interface User {
  _id: string;
  email: string;
  fullName: string;
  age: number;
  location: {
    country: string;
    city: string;
  };
  maritalStatus: MaritalStatus;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  // Passion Connect specific
  passionConnectProfile?: PassionConnectProfile;
  growthPercentage?: number; // 0-100
  growthTier?: GrowthTier;
  // Subscription
  subscriptionStatus?: SubscriptionStatus;
  subscriptionEndDate?: Date;
}

export interface PassionConnectProfile {
  id: string;
  userId: string;
  bio: string;
  photos: string[];
  interests: string[];
  whatYouSeek: string;
  testimonial?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  url: string;
  thumbnailUrl?: string;
  duration?: number; // for audio/video in seconds
  category?: string;
  tags: string[];
  isPremium: boolean;
  moduleAccess: ModuleAccess[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // admin userId
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  tier: CourseTier;
  price?: number; // for premium courses
  contents: string[]; // content IDs
  requiredForConnect?: boolean; // if true, completion unlocks Passion Connect tiers
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseProgress {
  id: string;
  userId: string;
  courseId: string;
  completionPercentage: number; // 0-100
  completedContents: string[]; // content IDs
  startedAt: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
}

export interface CommunityPost {
  id: string;
  userId: string;
  module: ModuleAccess;
  content: string;
  status: PostStatus;
  likes: string[]; // user IDs
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string; // admin userId
  rejectionReason?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: "TEXT" | "IMAGE" | "FILE";
  createdAt: Date;
}

export interface Chat {
  id: string;
  userId: string;
  adminId?: string;
  type: "USER_ADMIN" | "CONNECT_CHAT" | "COUNSELING";
  module?: ModuleAccess;
  participants: string[]; // user IDs
  lastMessage?: ChatMessage;
  lastActivityAt: Date;
  createdAt: Date;
  isAdminActive?: boolean; // for admin auto-exit
  adminExitsAt?: Date;
}

export interface Connection {
  id: string;
  user1Id: string;
  user2Id: string;
  status: "PENDING" | "CONNECTED" | "BLOCKED";
  chatId?: string;
  otherUser?: {
    id?: string;
    fullName?: string;
    avatarUrl?: string;
    age?: number;
  };
  createdAt: Date;
  connectedAt?: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  status: SubscriptionStatus;
  plan: "MONTHLY" | "YEARLY";
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase {
  id: string;
  userId: string;
  itemType: "COURSE" | "BOOK" | "CONTENT";
  itemId: string;
  amount: number;
  stripePaymentIntentId: string;
  status: "SUCCESS" | "FAILED" | "REFUNDED";
  createdAt: Date;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: string[];
  message?: string;
  status: "PENDING" | "CONTACTED" | "ACCEPTED" | "REJECTED";
  createdAt: Date;
}

export interface LiveStream {
  id: string;
  title: string;
  description?: string;
  streamUrl: string;
  audience: ModuleAccess[]; // SINGLES, COUPLES, or both
  isActive: boolean;
  startedAt: Date;
  endedAt?: Date;
  createdBy: string; // admin userId
}
