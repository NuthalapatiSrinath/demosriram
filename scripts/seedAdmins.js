// scripts/seedAdmins.js
// Script to create initial admin users in the database

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../src/database/models/user/user.model.js";
import { config } from "../src/config/index.js";

const adminUsers = [
  {
    name: "Sriram Kumar",
    email: "superadmin@gmail.com",
    password: "panacea",
    role: "superadmin",
    centerName: "All Centers",
    isVerified: true,
  },
  {
    name: "Rajesh Sharma",
    email: "delhi@sriram.com",
    password: "Delhi123!",
    role: "centeradmin",
    centerName: "Delhi Center",
    isVerified: true,
  },
  {
    name: "Priya Patel",
    email: "mumbai@sriram.com",
    password: "Mumbai123!",
    role: "centeradmin",
    centerName: "Mumbai Center",
    isVerified: true,
  },
  {
    name: "Karthik Reddy",
    email: "bangalore@sriram.com",
    password: "Bangalore123!",
    role: "centeradmin",
    centerName: "Bangalore Center",
    isVerified: true,
  },
  {
    name: "Lakshmi Naidu",
    email: "hyderabad@sriram.com",
    password: "Hyderabad123!",
    role: "centeradmin",
    centerName: "Hyderabad Center",
    isVerified: true,
  },
  {
    name: "Amit Verma",
    email: "staff@sriram.com",
    password: "Staff123!",
    role: "staff",
    centerName: null,
    isVerified: true,
  },
];

async function seedAdmins() {
  try {
    // Connect to database
    await mongoose.connect(config.db.url);
    console.log("✅ Connected to database");

    // Check if admins already exist
    const existingAdmins = await User.find({
      role: { $in: ["superadmin", "centeradmin", "staff"] },
    });

    if (existingAdmins.length > 0) {
      console.log("\n⚠️  Admin users already exist in database:");
      existingAdmins.forEach((admin) => {
        console.log(
          `   - ${admin.name} (${admin.email}) - Role: ${admin.role}${
            admin.centerName ? ` - Center: ${admin.centerName}` : ""
          }`,
        );
      });

      console.log(
        "\nℹ️  To reset and create new admin users, delete existing ones first.",
      );
      process.exit(0);
    }

    // Create admin users
    console.log("\n🔄 Creating admin users...\n");

    for (const adminData of adminUsers) {
      const admin = await User.create(adminData);
      console.log(
        `✅ Created: ${admin.name} (${admin.email}) - Role: ${admin.role}${
          admin.centerName ? ` - Center: ${admin.centerName}` : ""
        }`,
      );
    }

    console.log("\n✅ All admin users created successfully!");
    console.log("\n📋 Login Credentials:\n");
    console.log("Super Admin:");
    console.log("  Email: superadmin@sriram.com");
    console.log("  Password: SuperAdmin123!");
    console.log("\nDelhi Center Admin:");
    console.log("  Email: delhi@sriram.com");
    console.log("  Password: Delhi123!");
    console.log("\nMumbai Center Admin:");
    console.log("  Email: mumbai@sriram.com");
    console.log("  Password: Mumbai123!");
    console.log("\nBangalore Center Admin:");
    console.log("  Email: bangalore@sriram.com");
    console.log("  Password: Bangalore123!");
    console.log("\nHyderabad Center Admin:");
    console.log("  Email: hyderabad@sriram.com");
    console.log("  Password: Hyderabad123!");
    console.log("\nStaff:");
    console.log("  Email: staff@sriram.com");
    console.log("  Password: Staff123!");
    console.log("\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin users:", error);
    process.exit(1);
  }
}

// Run the seed function
seedAdmins();
