require("dotenv").config();

const mongoose = require("mongoose");
const testing_user = require("../dbschema/testing_user");

const TOTAL_USERS = 10000;

async function experiment1() {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("MongoDB connected");

    // Remove previous test data
    await testing_user.deleteMany({});

    console.log("Old test data removed");

    // Create 10K users in memory
    const users = [];

    console.time("Creating users");

    for (let i = 1; i <= TOTAL_USERS; i++) {
      users.push({
        name: `exp_User_${i}`,
        email: `exp1_user_${i}@test.com`,
        password: "password123",
        role: "user"
      });
    }

    console.timeEnd("Creating users");

    console.log(`Users created in memory: ${users.length}`);

    // Insert into MongoDB
    console.time("MongoDB insertMany");

    await testing_user.insertMany(users);

    console.timeEnd("MongoDB insertMany");

    const count = await testing_user.countDocuments();

    console.log(`Users in database: ${count}`);

    await mongoose.disconnect();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

experiment1();