require("dotenv").config() 
const express = require("express")
const mongoose = require("mongoose")
const router = require("./routes/route")
const port = 5000
const app = express()
app.use(express.json())
const conn = process.env.MONGO_URL

 // mongodb atlas connection 
mongoose.connect(conn, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("connected to MongoDB Atlas"))
.catch(err => console.error("error connecting:", err));


app.use("/", router )


app.use((err, req, res, next)=>{
  const statuscode = err.statuscode || 500
  console.log(err.message)
  res.status(statuscode).json({error: err.message})
})

app.listen(port, ()=>{
    console.log(`app running at http://localhost:${port}`) 
})