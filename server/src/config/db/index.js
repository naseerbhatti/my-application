import mongoose from "mongoose";
import config from "../index.js";

const dbUri = config.config.dbUri;  

if (!dbUri) {
  throw new Error("Missing env variable [dbUri]");
}

const connect_db = async () => {
  try {
    await mongoose.connect(dbUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed =>", error);
    process.exit(1);
  }
};

export default connect_db;
