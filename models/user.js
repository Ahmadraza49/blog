const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const userSchema = new Schema({
    fullName:
     { type: String, 
        required: true },
    email: 
    { 
        type: String, 
        required: true,
         unique: true },
    password: 
    { 
        type: String, 
        required: true 
    },
    profileImageURL:
     { type: String,
         default: "/images/avatar.png" 
        },
    role: 
    { type: String,
         enum: ["admin","user"], 
         default: "user" }
}, { timestamps: true });

// ✅ Pre-save hook using bcrypt (async)
userSchema.pre("save", async function() {
    if (!this.isModified("password")) return; // agar password change nahi hua to skip
    this.password = await bcrypt.hash(this.password, 10); // 10 salt rounds, automatic salt
});

// ✅ Optional: Password verification method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.matchPasswordAndCreateToken = async function(email, candidatePassword) {
    const user = await this.findOne({ email }); // await required
    if (!user) return false;
    const isMatch = await bcrypt.compare(candidatePassword, user.password);
    if (!isMatch) return false;
    const token = createTokenForUser(user);
    return token;
};

const User = mongoose.model("User", userSchema);
module.exports = User;