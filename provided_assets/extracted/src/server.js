
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mini_lms";

const server = async () => {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
  });
};

server();
