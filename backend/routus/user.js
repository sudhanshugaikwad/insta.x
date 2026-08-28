const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const requirelogin = require("../middelware/requirelogin");
const USER = mongoose.model("USER");
const POST = mongoose.model("POST");

// Get user profile with followers and following (public - no auth required)
router.get("/user/:userId", async (req, res) => {
    try {
        const user = await USER.findById(req.params.userId)
            .select("-password")
            .populate("followers", "_id name userName Photo")
            .populate("following", "_id name userName Photo");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const posts = await POST.find({ postedBy: req.params.userId })
            .populate("postedBy", "_id name userName Photo")
            .populate("comments.postedBy", "_id name userName Photo")
            .sort({ createdAt: -1 });

        return res.json({ user, posts });
    } catch (err) {
        console.error("Error loading user profile:", err);
        return res.status(500).json({ error: "Unable to load user profile" });
    }
});

// Get user profile for logged-in user
router.get("/myprofile", requirelogin, async (req, res) => {
    try {
        const user = await USER.findById(req.user._id)
            .select("-password")
            .populate("followers", "_id name userName Photo")
            .populate("following", "_id name userName Photo");

        const posts = await POST.find({ postedBy: req.user._id })
            .populate("postedBy", "_id name userName Photo")
            .populate("comments.postedBy", "_id name userName Photo")
            .sort({ createdAt: -1 });

        return res.json({ user, posts });
    } catch (err) {
        console.error("Error loading profile:", err);
        return res.status(500).json({ error: "Unable to load profile" });
    }
});

// Follow a user
router.put("/follow", requirelogin, async (req, res) => {
    const { followUserId } = req.body;

    if (!followUserId) {
        return res.status(422).json({ error: "Please provide user ID to follow" });
    }

    // Prevent user from following themselves
    if (req.user._id.toString() === followUserId) {
        return res.status(422).json({ error: "You cannot follow yourself" });
    }

    try {
        const targetUser = await USER.findById(followUserId);
        if (!targetUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if already following
        if (targetUser.followers.includes(req.user._id)) {
            return res.status(422).json({ error: "You are already following this user" });
        }

        // Add current user to target user's followers
        await USER.findByIdAndUpdate(
            followUserId,
            { $push: { followers: req.user._id } },
            { new: true }
        );

        // Add target user to current user's following
        const updatedUser = await USER.findByIdAndUpdate(
            req.user._id,
            { $push: { following: followUserId } },
            { new: true }
        )
            .populate("followers", "_id name userName Photo")
            .populate("following", "_id name userName Photo");

        return res.json({ message: "User followed successfully", user: updatedUser });
    } catch (err) {
        console.error("Error following user:", err);
        return res.status(500).json({ error: "Unable to follow user" });
    }
});

// Unfollow a user
router.put("/unfollow", requirelogin, async (req, res) => {
    const { unfollowUserId } = req.body;

    if (!unfollowUserId) {
        return res.status(422).json({ error: "Please provide user ID to unfollow" });
    }

    try {
        const targetUser = await USER.findById(unfollowUserId);
        if (!targetUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if following
        if (!targetUser.followers.includes(req.user._id)) {
            return res.status(422).json({ error: "You are not following this user" });
        }

        // Remove current user from target user's followers
        await USER.findByIdAndUpdate(
            unfollowUserId,
            { $pull: { followers: req.user._id } },
            { new: true }
        );

        // Remove target user from current user's following
        const updatedUser = await USER.findByIdAndUpdate(
            req.user._id,
            { $pull: { following: unfollowUserId } },
            { new: true }
        )
            .populate("followers", "_id name userName Photo")
            .populate("following", "_id name userName Photo");

        return res.json({ message: "User unfollowed successfully", user: updatedUser });
    } catch (err) {
        console.error("Error unfollowing user:", err);
        return res.status(500).json({ error: "Unable to unfollow user" });
    }
});

// Get followers list (public - no auth required)
router.get("/followers/:userId", async (req, res) => {
    try {
        const user = await USER.findById(req.params.userId)
            .select("followers")
            .populate("followers", "_id name userName Photo bio");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.json({ followers: user.followers });
    } catch (err) {
        console.error("Error loading followers:", err);
        return res.status(500).json({ error: "Unable to load followers" });
    }
});

// Get following list (public - no auth required)
router.get("/following/:userId", async (req, res) => {
    try {
        const user = await USER.findById(req.params.userId)
            .select("following")
            .populate("following", "_id name userName Photo bio");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.json({ following: user.following });
    } catch (err) {
        console.error("Error loading following:", err);
        return res.status(500).json({ error: "Unable to load following" });
    }
});

// Check if current user follows a specific user
router.get("/isFollowing/:userId", requirelogin, async (req, res) => {
    try {
        const targetUser = await USER.findById(req.params.userId).select("followers");

        if (!targetUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const isFollowing = targetUser.followers.includes(req.user._id);
        return res.json({ isFollowing });
    } catch (err) {
        console.error("Error checking follow status:", err);
        return res.status(500).json({ error: "Unable to check follow status" });
    }
});

module.exports = router;
