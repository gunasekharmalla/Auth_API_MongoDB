const express = require("express")
const app = express.Router()
const testing_user= require("../dbschema/testing_user")
const bcrypt = require("bcrypt")
require("dotenv").config()
app.use(express.json())
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const JWT_SECRET = process.env.JWT_SECRET




app.post("/register", async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const exist_user = await testing_user.findOne({ email });

        if (exist_user) {
            return res.status(400).json({
                message: "user already exists"
            });
        }

        await testing_user.create({
            name,
            email,
            password,
            role
        });

        res.status(201).json({
            message: "user inserted"
        });

    } catch (error) {
        next(error);
    }
});

module.exports = app;