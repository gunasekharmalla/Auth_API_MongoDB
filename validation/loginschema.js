const zod = require("zod")

const LoginSchema = zod.object({
    email: zod.string().email("please enter valid email"),
    password: zod.string().min(6, "password len min should be 6 chars") 
})


module.exports = {
    LoginSchema
}