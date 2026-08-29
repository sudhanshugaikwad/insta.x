const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const requirelogin = require("../middleware/requirelogin");
const USER = mongoose.model("USER");
const POST = mongoose.model("POST");

/**
 * GET /allUsers
 * Public route to browse available users.
 */
router.get("/allUsers", async (req, res) => {
  try {
    const query = req.user ? { _id: { $ne: req.user._id } } : {};
    const users = await USER.find(query)
      .select("_id name userName Photo bio followers")
      .sort({ createdAt: -1 });

    const enrichedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user.toObject(),
        posts: await POST.countDocuments({ postedBy: user._id }),
        isFollowing: req.user
          ? user.followers.some((id) => id.toString() === req.user._id.toString())
          : false,
      }))
    );

    return res.json({ users: enrichedUsers });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res.status(500).json({ error: "Unable to fetch users" });
  }
});

/**
 * GET /search
 * Search for users by name or username
 * Query: q (search term)
 */
router.get("/search", requirelogin, async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(422).json({ error: "Search query is required" });
  }

  try {
    const searchTerm = q.trim();

    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedTerm, "i");

    const users = await USER.find({
      $or: [{ name: regex }, { userName: regex }],
      _id: { $ne: req.user._id },
    })
      .select("_id name userName Photo bio followers")
      .limit(20);

    const enrichedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user.toObject(),
        posts: await POST.countDocuments({ postedBy: user._id }),
      }))
    );

    return res.json({ users: enrichedUsers });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ error: "Unable to search users" });
  }
});

/**
 * GET /suggestedUsers
 * Get suggested users to follow
 */
router.get("/suggestedUsers", requirelogin, async (req, res) => {
  try {
    const currentUser = await USER.findById(req.user._id).select("following");

    const suggestedUsers = await USER.find({
      _id: {
        $ne: req.user._id,
        $nin: currentUser.following,
      },
    })
      .select("_id name userName Photo bio followers")
      .sort({ createdAt: -1 });

    const users = await Promise.all(
      suggestedUsers.map(async (user) => ({
        ...user.toObject(),
        posts: await POST.countDocuments({ postedBy: user._id }),
        isFollowing: false,
      }))
    );

    return res.json({ users });
  } catch (error) {
    console.error("Error fetching suggested users:", error);
    return res.status(500).json({ error: "Unable to fetch suggested users" });
  }
});

/**
 * GET /trendingUsers
 * Get most followed users
 */
router.get("/trendingUsers", requirelogin, async (req, res) => {
  try {
    const trendingUsers = await USER.find({
      _id: { $ne: req.user._id },
    })
      .select("_id name userName Photo bio followers")
      .sort({ followers: -1, createdAt: -1 })
      .limit(6);

    const users = await Promise.all(
      trendingUsers.map(async (user) => ({
        ...user.toObject(),
        posts: await POST.countDocuments({ postedBy: user._id }),
      }))
    );

    return res.json({ users });
  } catch (error) {
    console.error("Error fetching trending users:", error);
    return res.status(500).json({ error: "Unable to fetch trending users" });
  }
});

module.exports = router;
