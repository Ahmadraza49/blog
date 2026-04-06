const { Router } = require("express");
const Comment = require("../models/comment");
const router = Router();

function isLoggedIn(req, res, next) {
  if (!req.user || !req.user._id) {
    console.log("❌ User not logged in or missing _id");
    return res.redirect("/user/signin");
  }
  next();
}

router.post("/add/:blogId", isLoggedIn, async (req, res) => {
  try {
    const { blogId } = req.params;
    const { text } = req.body;

    await Comment.create({ blog: blogId, user: req.user._id, text });

    res.redirect("/blog/view/" + blogId);
  } catch (err) {
    console.log("❌ Comment create error:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;