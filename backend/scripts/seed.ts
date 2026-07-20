/**
 * Seed database with test users for local development.
 * Run: npm run seed (from backend/)
 *
 * Requires MONGODB_URI in .env
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectMongoDB, disconnectMongoDB } from "../src/config/database";
import { UserModel } from "../src/models/user.model";
import { PassionConnectProfileModel } from "../src/models/passionConnectProfile.model";
import { hashPassword } from "../src/utils/auth";
import { UserRole } from "../src/shared/types";

const TEST_PASSWORD = "password123";

async function seed() {
  await connectMongoDB();

  console.log("Clearing existing test data...");
  await UserModel.deleteMany({
    email: {
      $in: [
        "admin@passionstreams.com",
        "sarah@test.com",
        "james@test.com",
        "mary@test.com",
      ],
    },
  });

  const password = await hashPassword(TEST_PASSWORD);
  const adminPassword = await hashPassword("passionstreamsADMIN");

  const admin = await UserModel.create({
    fullName: "Admin User",
    email: "admin@passionstreams.com",
    password: adminPassword,
    age: 30,
    location: { country: "Nigeria", city: "Lagos" },
    maritalStatus: "NOT_IN_RELATIONSHIP",
    role: UserRole.ADMIN,
  });

  const sarah = await UserModel.create({
    fullName: "Sarah Okonkwo",
    email: "sarah@test.com",
    password,
    age: 26,
    location: { country: "Nigeria", city: "Abuja" },
    maritalStatus: "NOT_IN_RELATIONSHIP",
    role: UserRole.USER,
    growthPercentage: 50,
    growthTier: "TIER_2",
  });

  const james = await UserModel.create({
    fullName: "James Adeyemi",
    email: "james@test.com",
    password,
    age: 28,
    location: { country: "Nigeria", city: "Lagos" },
    maritalStatus: "NOT_IN_RELATIONSHIP",
    role: UserRole.USER,
    growthPercentage: 75,
    growthTier: "TIER_2",
  });

  const mary = await UserModel.create({
    fullName: "Mary & David",
    email: "mary@test.com",
    password,
    age: 32,
    location: { country: "Nigeria", city: "Port Harcourt" },
    maritalStatus: "MARRIED",
    role: UserRole.USER,
  });

  await PassionConnectProfileModel.create([
    {
      userId: sarah._id,
      bio: "Faith-driven professional seeking intentional connection.",
      photos: [],
      interests: ["Worship", "Reading", "Travel"],
      whatYouSeek: "A godly partner committed to growth.",
      isActive: true,
    },
    {
      userId: james._id,
      bio: "Entrepreneur passionate about ministry and family.",
      photos: [],
      interests: ["Business", "Music", "Volunteering"],
      whatYouSeek: "Someone ready for marriage.",
      isActive: true,
    },
  ]);

  console.log("\n✅ Seed complete!\n");
  console.log("Admin login (/admin/login):");
  console.log("  Email: admin@passionstreams.com");
  console.log("  Password: passionstreamsADMIN\n");
  console.log("User logins (/login):");
  console.log("  sarah@test.com / password123  (Singles + Connect, age 26)");
  console.log("  james@test.com / password123  (Singles + Connect, age 28)");
  console.log("  mary@test.com  / password123  (Couples module)\n");

  await mongoose.disconnect();
  await disconnectMongoDB();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
