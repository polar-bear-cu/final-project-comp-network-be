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
      origin: [
        "http://172.20.10.1:5173",
        "http://172.20.10.2:5173",
        "http://172.20.10.3:5173",
        "http://172.20.10.4:5173",
        "http://172.20.10.5:5173",
        "http://172.20.10.6:5173",
        "http://172.20.10.7:5173",
        "http://172.20.10.8:5173",
        "http://172.20.10.9:5173",
        "http://172.20.10.10:5173",
        "http://172.20.10.11:5173",
        "http://172.20.10.12:5173",
        "http://172.20.10.13:5173",
        "http://172.20.10.14:5173",
      ],
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
