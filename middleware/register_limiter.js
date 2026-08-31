const limit = require("express-rate-limit") 

const registerLimiter = limit({
    windowMs: 15 * 60* 1000,
    limit: 5
})


module.exports = registerLimiter;