import http from "http";
import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSockets } from "./sockets/index.js";
import { attachSocket as attachSessionSocket } from "./controllers/sessionController.js";
import { attachTeamSocket } from "./controllers/teamController.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const start = async () => {
  await connectDB();
  const io = initSockets(server, process.env.CLIENT_URL);
  attachSessionSocket(io);
  attachTeamSocket(io);

  server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
};

mongoose.connection.on("error", (err) => {
  console.error("Mongo error:", err);
});

start();

