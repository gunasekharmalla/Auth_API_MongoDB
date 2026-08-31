const limit = require("express-rate-limit") 

const resetLimiter = limit({
    windowMs: 15 * 60* 1000,
    limit: 5
})


module.exports = resetLimiter;