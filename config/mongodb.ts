import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.set("strictQuery", true);
  const mongoUri = process.env.MONGO_URI || "";
  await mongoose.connect(mongoUri);
};

export default connectDB;
