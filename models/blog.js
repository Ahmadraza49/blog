const {Schema, model}= require("mongoose");

const blogSchema = new Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    // author: { type: Schema.Types.ObjectId, ref: "User", required: true },
   coverImageURL: { type: String, default: "/images/default-blog.png" },
   createdby: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tags: [String]
}, { timestamps: true });

const Blog = model("Blog", blogSchema);

module.exports = Blog;