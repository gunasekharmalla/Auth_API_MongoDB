const mongoose = require("mongoose");

const userdb = mongoose.connection.useDb("user");

const testing_user = userdb.model(
  "users_testing",
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true
      },

      email: {
        type: String,
        required: true,
        unique: true
      },

      password: {
        type: String,
        required: true
      },

      role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
      }
    },
    { timestamps: true }
  )
);

module.exports = testing_user;