const mongoose = require("mongoose") 

const userdb = mongoose.connection.useDb("test")
const User = userdb.model("users", new mongoose.Schema({
    name: {
        type: String, required: true
    },
    email: {
        type: String, required: true, unique: true
    },
    password: {
        type: String, required: true
    },
    role: {
        type: String, enum: ["user", "admin"], default: "user"
    }
}, { timestamps: true }))


module.exports = User;