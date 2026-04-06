const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

// Routes
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const commentRoute = require("./routes/comment");

const { checkForAuthenticationCookie } = require("./middlewares/authentication");
// console.log("AUTH:", checkForAuthenticationCookie);
const app = express();
const PORT = 8000;

// MongoDB
mongoose.connect("mongodb+srv://ahmadraza:ahmad494949@ac-4wby58n.yb2gwxx.mongodb.net/blog?retryWrites=true&w=majority")
  .then(() => console.log("✅ MongoDB connected!"))
  .catch(err => console.log("❌ MongoDB connection error:", err));

// Middlewares
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token")); // sets req.user if logged in

// View Engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Global user for templates
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use("/user", userRoute);
app.use("/blog", blogRoute);
app.use("/comments", commentRoute); // comment route is mounted on /comments

// Home Page
app.get("/", async (req, res) => {
  try {
    const Blog = require("./models/blog");
    const Comment = require("./models/comment");

    const blogs = await Blog.find({}).populate("createdby", "name").lean();

    const blogsWithComments = await Promise.all(
      blogs.map(async (b) => {
        const comments = await Comment.find({ blog: b._id }).populate("user", "name").lean();
        return { ...b, comments };
      })
    );

    res.render("home", { blogs: blogsWithComments, user: req.user || null });
  } catch (err) {
    console.log(err);
    res.render("home", { blogs: [], user: req.user || null });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));