import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is required");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { dbName: process.env.MONGO_DB_NAME || "question_of_the_day" });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};
