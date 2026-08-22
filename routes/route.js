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
const {UserSchema} = require("../validation/validation")
const {LoginSchema} = require("../validation/loginschema")
const zod = require("zod") 
const JWT_SECRET = process.env.JWT_SECRET

        // user registration 

app.post('/register', async (req, res, next) => {
    try {
      
        const results = UserSchema.safeParse(req.body)
        if(!results.success){
          return res.status(400).json({
            message :"validation failed",
            error: results.error.issues
          })
        }
        const { name, email, password , role} = results.data;
        const userexist = await User.findOne({ email });
        if (userexist) {
            return res.status(400).json({ message: "user already exists" });
        }

        const hashpswd = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashpswd,
            role: "user"
        });

        await newUser.save();
        res.status(201).send("user profile created");

    } catch (err) {
       next(err)
    }
});

            // user login 

app.post("/login", async (req,res, next)=>{
    try{
    
    const results = LoginSchema.safeParse(req.body)
    if(!results.success){
      return res.status(400).json({
        message: "enter valid input",
        error: results.error.issues
      })
    }
    const {email, password} = results.data;

    const existsUser = await User.findOne({email}) 
    if(!existsUser) return res.status(404).json({message:"user does not exist"})  
    
    const matched = await bcrypt.compare(password, existsUser.password)
    if(!matched) return res.status(404).json({message: "invalid password or to reset password go to users/forgot-password"}) 
    
    const token = jwt.sign(
        {id: existsUser.id, role: existsUser.role, name: existsUser.name},
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    )

    res.json({
        message: "login success",
        token: token
    })

} catch(err){ 
   next(err)
}

})
            // delete user admin req

app.delete("/users/:email",authMiddleware, RoleAuth("admin"), async (req, res, next)=>{
  const emailchecker = zod.object({
    email: zod.string().email("please enter valid email")
  })
    const results = emailchecker.safeParse(req.params)
    if(!results.success) return res.status(400).json({message: "enter user name", error: results.error})
    const {email} = results.data;
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
       next(err)
    })
})


app.get("/profile", authMiddleware, (req, res)=>{
    res.json({
        message: "this protected profile page",
        user: req.user
    })
})


app.patch("/users/updaterole/:email/role", authMiddleware, RoleAuth("admin"), async (req, res, next)=>{
  try{
  const zodemail = zod.object({
    email: zod.string().email("please enter valid email"),
    role: zod.enum(["user","admin"])
  })

  const data = {
    email: req.params.email,
    role: req.body.role
  }
  const results =  zodemail.safeParse(data)
  if(!results.success){
    return res.status(400).json({
      message: results.error.issues
    })
  }

  const { email, role } = results.data;
  const exist_user = await User.findOne({ email });

  if (!exist_user) {
      return res.status(404).json({
          message: "user not found"
      });
  }

  if (exist_user.role === role) {
      return res.status(200).json({
        message: "User already has this role"
      });
    }

await User.findOneAndUpdate(
    { email },
    { role }
);

return res.status(200).json({
    message: "user role updated successfully",
    email,
    oldRole: exist_user.role,
    newRole: role
});
}catch(err){
    next(err)
  }
})


const sgTransport = require("nodemailer-sendgrid-transport");

app.post("/forgot-password", async (req, res, next) => {
  try {
    const emailchecker = zod.object({
      email: zod.string().email("please enter valid email")
    })
    const data = emailchecker.safeParse(req.body)
    if(!data.success){
      return res.status(400).json({
        message: "enter valid email",
        error: data.error.issues
      })
    }

    const { email } = data.data;

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


app.post("/reset-password/:token", async (req, res, next) => {
  const { token } = req.params;

   const passwordchecker = zod.object({
      password: zod.string().min(6, "password should be len 6 min ")
    })
    const results= passwordchecker.safeParse(req.body)
  if(!results.success){
    return res.status(400).json({
      message: results.error.issues
    })
  }
  const { password } = results.data;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.json({ message: "Password reset successful!" });
  } catch (err) {
    err.statuscode = 400;
   next(err)
  }
});


module.exports = app;