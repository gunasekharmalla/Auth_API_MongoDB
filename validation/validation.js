const zod = require("zod") 

const UserSchema = zod.object({
    name: zod.string().min(1, "please enter valid name") ,
    email: zod.string().email("please enter valid email"), 
    password: zod.string().min(6,"please enter min 6 charecters"),
    role: zod.enum(['admin', "user"])
})



module.exports = {
    UserSchema
}