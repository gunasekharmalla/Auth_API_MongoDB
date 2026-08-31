require("dotenv").config() 
const express = require("express")
const mongoose = require("mongoose")
const router = require("./routes/route")
const port = 5000
const app = express()
app.use(express.json())
const AppError = require("./utils/AppError")
const logger = require("./utils/logger")
const pinohttp = require("pino-http")
const env_variables = ["MONGO_URL", "JWT_SECRET", "SENDGRID_API_KEY"]
const res = env_variables.filter(vars => !process.env[vars])
if (res.length > 0) {
 logger.error(`Missing env vars: ${res.join(", ")}`)
  process.exit(1);
}

const httplogger = pinohttp({
  logger: logger,
  redact : [
    "req.headers"
  ]
})

const conn = process.env.MONGO_URL

// mongodb atlas connection 
mongoose.connect(conn, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(()=> logger.info("mongodb atlas connected"))
.catch((err)=> logger.error({error: err.message}))


app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>Auth API — MongoDB</title></head>
      <body style="font-family: sans-serif; padding: 40px;">
        <h1>Authentication API</h1>
        <p>A production-style authentication and user-management API built with Node.js, Express, and MongoDB.</p>
        <p>JWT auth · role-based access · password reset via email · Zod validation</p>
        <p><a href="https://github.com/gunasekharmalla/Auth_API_MongoDB">View source on GitHub</a></p>
      </body>
    </html>
  `);
});


app.use(httplogger)

app.use("/", router )

app.use((req, res, next)=>{
  next(new AppError(`route ${req.originalUrl} not found`, 404))
})

app.use((err, req, res, next)=>{
  const statusCode = err.statusCode || 500
  //console.log(err.message)
  logger.error({error: err.message}, "something went wrong")
  res.status(statusCode).json({error: err.isOperational ? err.message : "something went wrong"})

})

app.listen(port, ()=>{
   logger.info(`server running at http://localhost:${port}`)
})
