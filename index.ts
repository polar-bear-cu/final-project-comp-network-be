import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./users/userRoute";
import connectDB from "./config/mongodb";
import { allowedOrigins } from "./config/cors";

dotenv.config({ path: ".env" });
connectDB();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.get("/api/v1/connection", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/v1/user", userRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
