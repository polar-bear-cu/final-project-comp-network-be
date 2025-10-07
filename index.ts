import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./users/userRoute";
import connectDB from "./config/mongodb";
import cookieParser from "cookie-parser";
import { Server, Socket } from "socket.io";

async function startServer() {
  dotenv.config({ path: ".env" });
  connectDB();

  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
      credentials: true,
    })
  );
  app.use(cookieParser());

  app.get("/api/v1/connection", (req, res) => {
    res.send("Hello, World!");
  });
  app.use("/api/v1/user", userRouter);

  const httpServer = createServer(app);
  const io = new Server(httpServer);

  const userSockets = new Map<string, string>();

  io.on("connection", (socket: Socket) => {
    const userId = socket.handshake.query.userid as string;

    if (!userId) {
      console.log("No userid provided. Disconnecting socket:", socket.id);
      socket.disconnect();
      return;
    }

    if (userSockets.has(userId)) {
      const oldSocketId = userSockets.get(userId) || "";
      const oldSocket = io.sockets.sockets.get(oldSocketId);
      if (oldSocket) {
        oldSocket.disconnect(true);
      }
    }

    userSockets.set(userId, socket.id);

    console.log(`Socket connected for user ${userId}: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      userSockets.delete(userId);
    });
  });

  app.set("io", io);

  const PORT = process.env.PORT;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
