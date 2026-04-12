const mongoose = require('mongoose');
require('dotenv').config();

const testConnect = async () => {
  try {
    console.log("Testing connection to:", process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lab-equipment-db');
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lab-equipment-db', {
      serverSelectionTimeoutMS: 5000
    });
    console.log("SUCCESS: Connected to", conn.connection.host);
    process.exit(0);
  } catch (error) {
    console.error("FAILURE: Could not connect to MongoDB.");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    process.exit(1);
  }
};

testConnect();
