const express = require("express")
const app = express.Router()
const User = require("../dbschema/User")
const bcrypt = require("bcrypt")
require("dotenv").config()
app.use(express.json())
const jwt = require("jsonwebtoken")
const authMiddleware = require("../middleware/Auth")
const RoleAuth = require("../middleware/RoleAuth")
const nodemailer = require("nodemailer")
const JWT_SECRET = process.env.JWT_SECRET

        // user registration 

app.post('/register', async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "name, email, and password are required" });
        }

        const userexist = await User.findOne({ email });
        if (userexist) {
            return res.status(400).json({ message: "user already exists" });
        }

        const hashpswd = await bcrypt.hash(password, 10);

        const newUser = new User({
           // id: uuidv4(),
            name,
            email,
            password: hashpswd,
            role: role || "user"
        });

        await newUser.save();
        res.status(201).send("user profile created");

    } catch (err) {
       // res.status(500).json({ message: err.message });
       next(err)
    }
});

            // user login 

app.post("/login", async (req,res, next)=>{
    try{
    const {email, password} = req.body;
    if(!email || !password) return res.status(400).json({message: "enter email password"}) 
    
    const existsUser = await User.findOne({email}) 
    if(!existsUser) return res.json({message:"user does not exist"})  
    
    const matched = await bcrypt.compare(password, existsUser.password)
    if(!matched) return res.json({message: "invalid password or to reset password go to users/forgot-password"}) 
    
    const token = jwt.sign(
        {id: existsUser.id, role: existsUser.role, name: existsUser.name},
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
    )

    res.json({
        message: "login success",
        token: token
    })

} catch(err){ /*
    res.json({
        message: "token error"
    }) */
   next(err)
}

})
            // delete user admin req

app.delete("/users/:email",authMiddleware, RoleAuth("admin"), async (req, res, next)=>{
    const {email} = req.params;
    if(!email) return res(400).json({message: "enter user name"})
    try{
    const existUser = await User.findOne({email}) 
    if (!existUser) return res.status(404).json({message: "user not found"})
    await User.deleteOne({email}).then(()=>{
        res.json({message: "user deleted"})
    })
  }catch(err){
    next(err)
  }
})

                // get all users admin req

app.get("/users",authMiddleware, RoleAuth("admin"), async (req, res, next)=>{
    await User.find().select("-password").then(users=>{
        res.json(users)
    }).catch(err=>{
       // res.json({message: err.message})
       next(err)
    })
})


app.get("/profile", authMiddleware, (req, res)=>{
    res.json({
        message: "this protected profile page",
        user: req.user
    })
})
const sgTransport = require("nodemailer-sendgrid-transport");

app.post("/forgot-password", authMiddleware, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // generate token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    const resetLink = `http://localhost:5000/reset-password/${resetToken}`;

    // Configure SendGrid transporter (API method)
    const transporter = nodemailer.createTransport(
      sgTransport({
        auth: {
          api_key: process.env.SENDGRID_API_KEY, // Your SendGrid API key
        },
      })
    );

    // Send email
    await transporter.sendMail({
      from: "your-email@example.com", // Verified sender in SendGrid
      to: email,
      subject: "Password Reset",
      text: `Click here to reset your password: ${resetLink}`,
    });

    return res.json({ message: "Reset email sent successfully" });
  } catch (err) {
    console.log(err);
    next(err);
  }
});


app.post("/reset-password/:token",authMiddleware, async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.json({ message: "Password reset successful!" });
  } catch (err) {
   // res.status(400).json({ message: "Invalid or expired token" });
   next(err)
  }
});


module.exports = app;