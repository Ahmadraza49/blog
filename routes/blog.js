const { Router } = require("express");
const router = Router();
const Blog = require("../models/blog");

// 🔥 Multer + Cloudinary
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// ✅ Cloudinary Storage setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog-images",
    allowed_formats: ["jpg", "png", "jpeg"]
  }
});

const upload = multer({ storage });

// 🔹 Add Blog page
router.get("/add", (req, res) => {
  if (!req.user) return res.redirect("/user/signin");
  res.render("addblog", { user: req.user });
});

// 🔹 Create Blog
router.post("/create", upload.single("coverImage"), async (req, res) => {
  try {
    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILE:", req.file);

    const { title, body, tags } = req.body;

    const newBlog = new Blog({
      title,
      body,
      tags: tags ? tags.split(",").map(t => t.trim()) : [],
      createdby: req.user.id,
      coverImageURL: req.file?.path || "/images/default-blog.png" // Cloudinary URL or default
    });

    await newBlog.save();
    console.log("✅ Blog saved:", newBlog);
    res.redirect("/");
  } catch (err) {
    console.log("❌ Error creating blog:", err);
    res.render("addblog", { error: "Error creating blog", user: req.user });
  }
});

// 🔥 DELETE BLOG
router.post("/delete/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    // ✅ Safe check: owner only
    if (!blog || !req.user || blog.createdby.toString() !== req.user.id) {
      return res.redirect("/");
    }

    await Blog.findByIdAndDelete(req.params.id);
    console.log("✅ Blog deleted:", req.params.id);
    res.redirect("/");
  } catch (err) {
    console.log("❌ Error deleting blog:", err);
    res.redirect("/");
  }
});

// 🔥 EDIT PAGE
router.get("/edit/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    // ✅ Safe check: owner only
    if (!blog || !req.user || blog.createdby.toString() !== req.user.id) {
      return res.redirect("/");
    }

    res.render("editblog", { blog, user: req.user });
  } catch (err) {
    console.log("❌ Error loading edit page:", err);
    res.redirect("/");
  }
});

// 🔹 View Single Blog
router.get("/view/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.redirect("/"); // agar blog na mile
    }

    res.render("viewblog", { blog, user: req.user });
  } catch (err) {
    console.log("❌ Error fetching blog:", err);
    res.redirect("/");
  }
});
// 🔥 UPDATE BLOG
router.post("/edit/:id", upload.single("coverImage"), async (req, res) => {
  try {
    const { title, body, tags } = req.body;
    const blog = await Blog.findById(req.params.id);

    // ✅ Safe check: owner only
    if (!blog || !req.user || blog.createdby.toString() !== req.user.id) {
      return res.redirect("/");
    }

    // Update blog details
    blog.title = title;
    blog.body = body;
    blog.tags = tags ? tags.split(",").map(t => t.trim()) : [];
    if (req.file) blog.coverImageURL = req.file.path; // Update image if new file uploaded

    await blog.save();
    console.log("✅ Blog updated:", blog._id);
    res.redirect("/");
  } catch (err) {
    console.log("❌ Error updating blog:", err);
    res.redirect("/");
  }
});

module.exports = router;