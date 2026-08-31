const ratelimiter = require("express-rate-limit")

const loginlimiter = ratelimiter({
    windowMs: 15 * 60 * 10000,
    limit: 10
})


module.exports = loginlimiter;