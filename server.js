require("dotenv").config() 
const express = require("express")
const User = require("./dbschema/User")
//const {v4: uuidv4} = require("uuid")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const authMiddleware = require("./middleware/Auth")
const RoleAuth = require("./middleware/RoleAuth")
const port = 5000
const app = express()

app.use(express.json())

const conn = process.env.MONGO_URL
mongoose.connect(conn, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("connected to MongoDB Atlas"))
.catch(err => console.error("error connecting:", err));



app.post('/signup', async (req, res) => {
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
        res.status(500).json({ message: err.message });
    }
});

app.post("/login", async (req,res)=>{
    try{
    const {email, password} = req.body;
    if(!email || !password) return res.status(400).json({message: "enter email password"}) 
    
    const existsUser = await User.findOne({email}) 
    if(!existsUser) return res.json({message:"user does not exist"})  
    
    const matched = bcrypt.compare(password, existsUser.password)
    if(!matched) return res.json({message: "invalid password"}) 
    
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
    res.json({
        message: "token error"
    })
}

})

app.delete("/users/:email", authMiddleware, RoleAuth("admin"), async (req, res)=>{
    const {email} = req.params;
    if(!email) return res(400).json({message: "enter user name"})
    const existUser = await User.findOne({email}) 
    if (!existUser) return res.status(404).json({message: "user not found"})
    await User.deleteOne({email}).then(()=>{
        res.json({message: "user deleted"})
    }).catch(err=>{
        res.json({message: err.message})
    }) 
})


app.get("/users",authMiddleware, RoleAuth("admin"),async (req, res)=>{
    await User.find().select("-password").then(users=>{
        res.json(users)
    }).catch(err=>{
        res.json({message: err.message})
    })
})

app.get("/profile", authMiddleware, (req, res)=>{
    res.json({
        message: "this protected profile page",
        user: req.user
    })
})



app.listen(port, ()=>{
    console.log(`app running at http://localhost:${port}`) 
})