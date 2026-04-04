const path = require("path");
const express = require("express");
const userRoute = require("./routes/user");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middlewares/authentication.js");
const Blog = require("./models/blog"); // 👈 ADD THIS

const app = express();
const PORT = 8000;
const BlogRoute = require("./routes/blog");

// MongoDB
mongoose.connect("mongodb+srv://ahmadraza:ahmad494949@ac-4wby58n.yb2gwxx.mongodb.net/blog?retryWrites=true&w=majority")
  .then(() => console.log("✅ MongoDB connected!"))
  .catch(err => console.log("❌ MongoDB connection error:", err));

// Middlewares
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

app.use("/blog", BlogRoute);

// 🔥 GLOBAL USER
app.use((req, res, next) => {
    res.locals.user = req.user || { fullName: "Guest" };
    next();
});

// View Engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// ✅ UPDATED HOME ROUTE
// ✅ UPDATED HOME ROUTE
app.get("/", async (req, res) => {
    try {
        // 🔹 Fetch all blogs, ignore login
        const blogs = await Blog.find({}); 

        // 🔹 Render home page, user is optional
        res.render("home", { blogs, user: req.user || null });
    } catch (err) {
        console.log(err);
        res.render("home", { blogs: [], user: req.user || null });
    }
});

app.use("/user", userRoute);

// Server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));