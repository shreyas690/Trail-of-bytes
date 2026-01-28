import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../src/config/db.js";
import Admin from "../src/models/Admin.js";

dotenv.config();

const seedAdmin = async () => {
  await connectDB();
  const username = process.argv[2] || "admin";
  const password = process.argv[3] || "admin";
  const passwordHash = await bcrypt.hash(password, 10);

  await Admin.findOneAndUpdate(
    { username },
    { passwordHash },
    { upsert: true, new: true }
  );
  console.log(`Seeded admin ${username}`);
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});

