import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: {type: String, required: true,},
    status: String,
    role: String
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next()
    try{
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    } catch (error) {
        next(error);
    }

})

export default mongoose.model('Users', userSchema)