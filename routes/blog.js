const { Router } = require("express");
const Blog = require("../models/blog");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const router = Router();

// 🔹 Cloudinary setup
const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "blog-images", allowed_formats: ["jpg", "png", "jpeg"] }
});
const upload = multer({ storage });

// 🔹 Auth middleware
function isLoggedIn(req, res, next) {
  if (!req.user) return res.redirect("/user/signin");
  next();
}

// 🔹 Add Blog Page
router.get("/add", isLoggedIn, (req, res) => {
  res.render("addblog", { user: req.user });
});

// 🔹 Create Blog
router.post("/create", isLoggedIn, upload.single("coverImage"), async (req, res) => {
  try {
    const { title, body, tags } = req.body;

    if (!title || !body) {
      return res.render("addblog", { error: "Title and Body required", user: req.user });
    }

    const newBlog = await Blog.create({
      title,
      body,
      tags: tags ? tags.split(",").map(t => t.trim()) : [],
      createdby: req.user._id,
      coverImageURL: req.file?.path || "/images/default-blog.png",
    });

    res.redirect(`/blog/view/${newBlog._id}`);
  } catch (err) {
    console.log("❌ Error creating blog:", err);
    res.render("addblog", { error: "Something went wrong", user: req.user });
  }
});

// 🔹 View Single Blog
router.get("/view/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdby", "fullName").lean();
    if (!blog) return res.redirect("/");

    const Comment = require("../models/comment");
    const comments = await Comment.find({ blog: blog._id }).populate("user", "name").lean();

    res.render("comment", { blog, comments, user: req.user || null });
  } catch (err) {
    console.log("❌ Error fetching blog:", err);
    res.redirect("/");
  }
});

// 🔹 GET Edit Blog
router.get("/edit/:id", isLoggedIn, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog) return res.redirect("/");
    if (blog.createdby.toString() !== req.user.id) return res.redirect("/");

    res.render("editblog", { blog, user: req.user });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

// 🔹 POST Update Blog
router.post("/edit/:id", isLoggedIn, upload.single("coverImage"), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.redirect("/");
    if (blog.createdby.toString() !== req.user.id) return res.redirect("/");

    const { title, body, tags } = req.body;
    blog.title = title || blog.title;
    blog.body = body || blog.body;
    blog.tags = tags ? tags.split(",").map(t => t.trim()) : blog.tags;
    if (req.file?.path) blog.coverImageURL = req.file.path;

    await blog.save();
    res.redirect(`/blog/view/${blog._id}`);
  } catch (err) {
    console.log(err);
    res.render("editblog", { blog: req.body, error: "Update failed", user: req.user });
  }
});

// 🔹 DELETE Blog
router.post("/delete/:id", isLoggedIn, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.redirect("/");
    if (blog.createdby.toString() !== req.user.id) return res.redirect("/");

    await Blog.findByIdAndDelete(req.params.id);
    res.redirect("/"); // 🔹 Delete ke baad home page
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

module.exports = router;