import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  return new Promise((resolve, reject) => {
    mongoose
      .connect(MONGO_URI, options)
      .then((mon) => {
        console.log("MongoDB connected");
        resolve(mon);
      })
      .catch((error) => {
        console.log("connection failed");
        reject(error);
      });
  });
};

export default connectDB;
