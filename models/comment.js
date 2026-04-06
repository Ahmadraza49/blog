const { Schema, model } = require("mongoose");

const commentSchema = new Schema({
    blog: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
}, { timestamps: true });

module.exports = model("Comment", commentSchema);