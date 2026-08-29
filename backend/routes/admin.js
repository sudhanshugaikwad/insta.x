const express = require("express");
const mongoose = require("mongoose");
const requireadmin = require("../middleware/requireadmin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
const USER = mongoose.model("USER");
const POST = mongoose.model("POST");

router.post("/admin/login", async (req, res) => {
  const { userName, password } = req.body;
  const configuredUserName = process.env.ADMIN_USERNAME;
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (!configuredUserName || !configuredPassword) {
    return res.status(503).json({ error: "Admin credentials are not configured" });
  }
  if (userName !== configuredUserName || password !== configuredPassword) {
    return res.status(401).json({ error: "Invalid admin credentials" });
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL || `${configuredUserName}@admin.local`;
    let admin = await USER.findOne({ userName: configuredUserName });
    if (!admin) {
      admin = await USER.create({
        name: "Administrator",
        userName: configuredUserName,
        email: adminEmail,
        password: await bcrypt.hash(configuredPassword, 12),
        role: "admin",
      });
    } else if (admin.role !== "admin") {
      admin.role = "admin";
      await admin.save();
    }

    const token = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, user: { _id: admin._id, name: admin.name, userName: admin.userName, role: "admin" } });
  } catch (error) {
    console.error("Admin login failed:", error);
    res.status(500).json({ error: "Unable to sign in as admin" });
  }
});

router.get("/admin/overview", requireadmin, async (req, res) => {
  try {
    const [users, posts] = await Promise.all([
      USER.find().select("-password").sort({ createdAt: -1 }),
      POST.find().populate("postedBy", "_id name userName Photo").sort({ createdAt: -1 }),
    ]);
    res.json({ users, posts, counts: { users: users.length, posts: posts.length } });
  } catch (error) {
    console.error("Admin overview failed:", error);
    res.status(500).json({ error: "Unable to load admin dashboard" });
  }
});

router.put("/admin/users/:userId", requireadmin, async (req, res) => {
  const { name, userName, email, bio, role, suspended } = req.body;
  try {
    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (userName !== undefined) updates.userName = String(userName).trim();
    if (email !== undefined) updates.email = String(email).trim().toLowerCase();
    if (bio !== undefined) updates.bio = String(bio);
    if (role !== undefined) updates.role = role;
    if (suspended !== undefined) updates.suspended = Boolean(suspended);
    const updatedUser = await USER.findByIdAndUpdate(req.params.userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json({ user: updatedUser });
  } catch (error) {
    const duplicate = error.code === 11000;
    res.status(duplicate ? 409 : 422).json({ error: duplicate ? "Email or username is already in use" : "Unable to update user" });
  }
});

router.delete("/admin/users/:userId", requireadmin, async (req, res) => {
  try {
    if (req.params.userId === req.user._id.toString()) {
      return res.status(422).json({ error: "You cannot delete your own admin account" });
    }
    const user = await USER.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    await POST.deleteMany({ postedBy: req.params.userId });
    res.json({ message: "User and posts deleted" });
  } catch (error) {
    res.status(500).json({ error: "Unable to delete user" });
  }
});

router.delete("/admin/posts/:postId", requireadmin, async (req, res) => {
  try {
    const post = await POST.findByIdAndDelete(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ error: "Unable to delete post" });
  }
});

module.exports = router;
