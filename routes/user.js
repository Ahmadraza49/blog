const { Router } = require('express');
const User = require("../models/user");
const { createTokenForUser } = require("../services/authentication");

const router = Router();

// 🔹 SIGNIN PAGE
router.get("/signin", (req, res) => {
    res.render("signin", { error: null }); // initially no error
});

// 🔹 SIGNUP PAGE
router.get("/signup", (req, res) => {
    res.render("signup");
});

// 🔹 LOGOUT
router.get("/logout", (req, res) => {
    res.clearCookie("token"); // token cookie delete
    res.redirect("/");         // homepage pe redirect
});
// 🔹 SIGNUP LOGIC
router.post("/signup", async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        const newUser = await User.create({ fullName, email, password });

        // ✅ token generate karo
        const token = createTokenForUser(newUser);

        console.log("✅ New User Created:", newUser);

        return res
            .cookie("token", token, {
                httpOnly: true
            })
            .redirect("/");

    } catch (err) {
        console.log("❌ Signup Error:", err);
        return res.render("signup", { error: "Error creating user" });
    }
});

// 🔹 SIGNIN LOGIC
router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        // user search
        const existingUser = await User.findOne({ email });

        // agar user nahi hai ya password match nahi karta
        if (!existingUser || !(await existingUser.comparePassword(password))) {
            return res.render("signin", { error: "Incorrect email or password" });
        }

        // agar sahi ho, token generate karo
        const token = createTokenForUser(existingUser);

        // cookie set karo
        return res
            .cookie("token", token, {
                httpOnly: true,
                secure: false
            })
            .redirect("/"); // ya dashboard

    } catch (err) {
        console.log("❌ Login Error:", err);
        return res.render("signin", { error: "Server error" });
    }
});

module.exports = router;