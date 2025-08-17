
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import User from "../src/models/User.js";

const run = async () => {
  await connectDB(process.env.MONGO_URI);
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@symplora.local";
  const adminPass = process.env.SEED_ADMIN_PASSWORD || "Admin@123";
  const exists = await User.findOne({ email: adminEmail });
  if (exists) {
    console.log("Admin already exists:", adminEmail);
  } else {
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: adminPass,
      role: "admin"
    });
    console.log("Admin created:", adminEmail, "password:", adminPass);
  }
  await mongoose.disconnect();
  process.exit(0);
};

run().catch(e => {
  console.error(e);
  process.exit(1);
});
