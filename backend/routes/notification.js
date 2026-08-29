const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const requirelogin = require("../middleware/requirelogin");
const USER = mongoose.model("USER");
const NOTIFICATION = mongoose.model("NOTIFICATION");

/**
 * GET /notifications
 * Fetch all notifications for the current user
 */
router.get("/notifications", requirelogin, async (req, res) => {
  try {
    const notifications = await NOTIFICATION.find({ userId: req.user._id })
      .populate("actorId", "_id name userName Photo")
      .populate("postId", "_id photos")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ error: "Unable to fetch notifications" });
  }
});

/**
 * GET /notifications/unread/count
 * Get count of unread notifications
 */
router.get("/notifications/unread/count", requirelogin, async (req, res) => {
  try {
    const count = await NOTIFICATION.countDocuments({
      userId: req.user._id,
      read: false,
    });

    return res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return res.status(500).json({ error: "Unable to fetch unread count" });
  }
});

/**
 * PUT /notifications/:notificationId/read
 * Mark a notification as read
 */
router.put("/notifications/:notificationId/read", requirelogin, async (req, res) => {
  try {
    const notification = await NOTIFICATION.findOneAndUpdate(
      { _id: req.params.notificationId, userId: req.user._id },
      { read: true },
      { new: true }
    )
      .populate("actorId", "_id name userName Photo")
      .populate("postId", "_id photos");

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.json({ notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({ error: "Unable to update notification" });
  }
});

/**
 * PUT /notifications/markAll/read
 * Mark all notifications as read
 */
router.put("/notifications/markAll/read", requirelogin, async (req, res) => {
  try {
    await NOTIFICATION.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    return res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return res.status(500).json({ error: "Unable to update notifications" });
  }
});

/**
 * DELETE /notifications/:notificationId
 * Delete a single notification
 */
router.delete("/notifications/:notificationId", requirelogin, async (req, res) => {
  try {
    const notification = await NOTIFICATION.findOneAndDelete({
      _id: req.params.notificationId,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({ error: "Unable to delete notification" });
  }
});

/**
 * DELETE /notifications/clear/all
 * Clear all notifications for user
 */
router.delete("/notifications/clear/all", requirelogin, async (req, res) => {
  try {
    await NOTIFICATION.deleteMany({ userId: req.user._id });

    return res.json({ message: "All notifications cleared" });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return res.status(500).json({ error: "Unable to clear notifications" });
  }
});

module.exports = router;
