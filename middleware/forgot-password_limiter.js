const limit = require("express-rate-limit")

const forgotPasswordLimit = limit({
    windowMs: 15 * 60 * 1000,
    limit: 3
})


module.exports = forgotPasswordLimit;