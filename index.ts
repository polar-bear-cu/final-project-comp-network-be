import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./users/userRoute";
import connectDB from "./config/mongodb";
import cookieParser from "cookie-parser";
import { initSocket } from "./socket";

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
  const io = initSocket(httpServer);
  app.set("io", io);

  const PORT = process.env.PORT;
  const IP = process.env.IP;

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on ${IP}:${PORT}`);
  });
}

startServer();
