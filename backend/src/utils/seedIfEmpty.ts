import { UserModel } from "../models/user.model";
import { PassionConnectProfileModel } from "../models/passionConnectProfile.model";
import { hashPassword } from "./auth";
import { UserRole } from "../shared/types";

const TEST_USERS = [
  "admin@passionstreams.com",
  "sarah@test.com",
  "james@test.com",
  "mary@test.com",
];

export async function seedIfEmpty() {
  // Seed when empty so first Render deploy has admin/test users.
  // Set SEED_IF_EMPTY=false to disable.
  if (process.env.SEED_IF_EMPTY === "false") return;

  const count = await UserModel.countDocuments({ email: { $in: TEST_USERS } });
  if (count >= TEST_USERS.length) return;

  console.log("Seeding database with default accounts...");

  await UserModel.deleteMany({ email: { $in: TEST_USERS } });

  const password = await hashPassword("password123");
  const adminPassword = await hashPassword("passionstreamsADMIN");

  await UserModel.create({
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

  await UserModel.create({
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

  console.log("Dev seed ready — admin@passionstreams.com / passionstreamsADMIN");
  console.log("Users: sarah@test.com, james@test.com, mary@test.com / password123");
}
