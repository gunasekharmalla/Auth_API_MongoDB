require("dotenv").config() 
const express = require("express")
const mongoose = require("mongoose")
const router = require("./routes/route")
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

app.use((err, req, res, next)=>{
  console.log(err.message)
  res.status(500).json({error: err.message})
})

app.use("/", router )

app.listen(port, ()=>{
    console.log(`app running at http://localhost:${port}`) 
})