const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const requirelogin = require("../middleware/requirelogin");
const USER = mongoose.model("USER");
const MESSAGE = mongoose.model("MESSAGE");

/**
 * POST /message
 * Send a message to another user
 */
router.post("/message", requirelogin, async (req, res) => {
  const { receiverId, message } = req.body;

  if (!receiverId || !message) {
    return res.status(422).json({ error: "Receiver ID and message are required" });
  }

  if (message.trim().length === 0) {
    return res.status(422).json({ error: "Message cannot be empty" });
  }

  if (req.user._id.toString() === receiverId) {
    return res.status(422).json({ error: "You cannot send message to yourself" });
  }

  try {
    // Verify receiver exists
    const receiver = await USER.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    // Create and save message
    const newMessage = new (mongoose.model("MESSAGE"))({
      senderId: req.user._id,
      receiverId: receiverId,
      message: message.trim(),
    });

    await newMessage.save();

    const populatedMessage = await newMessage
      .populate("senderId", "_id name userName Photo")
      .populate("receiverId", "_id name userName Photo");

    return res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: "Unable to send message" });
  }
});

/**
 * GET /messages/:userId
 * Fetch conversation with another user
 * Query: page (optional, default 0), limit (optional, default 20)
 */
router.get("/messages/:userId", requirelogin, async (req, res) => {
  const { userId } = req.params;
  const { page = 0, limit = 50 } = req.query;

  try {
    const messages = await MESSAGE.find({
      $or: [
        { senderId: req.user._id, receiverId: userId },
        { senderId: userId, receiverId: req.user._id },
      ],
    })
      .populate("senderId", "_id name userName Photo")
      .populate("receiverId", "_id name userName Photo")
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(parseInt(limit));

    // Mark messages as read for current user
    await MESSAGE.updateMany(
      {
        senderId: userId,
        receiverId: req.user._id,
        read: false,
      },
      { read: true }
    );

    // Get user info
    const otherUser = await USER.findById(userId).select(
      "_id name userName Photo bio followers following"
    );

    return res.json({ messages: messages.reverse(), user: otherUser });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ error: "Unable to fetch messages" });
  }
});

/**
 * GET /conversations
 * Get list of all conversations (latest message from each user)
 */
router.get("/conversations", requirelogin, async (req, res) => {
  try {
    // Find all unique users the current user has messaged
    const allMessages = await MESSAGE.aggregate([
      {
        $match: {
          $or: [{ senderId: mongoose.Types.ObjectId(req.user._id) },
                { receiverId: mongoose.Types.ObjectId(req.user._id) }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", mongoose.Types.ObjectId(req.user._id)] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $limit: 50,
      },
    ]);

    const conversations = allMessages.map((item) => ({
      user: {
        _id: item.user._id,
        name: item.user.name,
        userName: item.user.userName,
        Photo: item.user.Photo,
      },
      lastMessage: {
        message: item.lastMessage.message,
        createdAt: item.lastMessage.createdAt,
        read: item.lastMessage.read,
        senderId: item.lastMessage.senderId,
      },
    }));

    return res.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ error: "Unable to fetch conversations" });
  }
});

/**
 * GET /unread-messages/count
 * Get count of unread messages
 */
router.get("/unread-messages/count", requirelogin, async (req, res) => {
  try {
    const count = await MESSAGE.countDocuments({
      receiverId: req.user._id,
      read: false,
    });

    return res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return res.status(500).json({ error: "Unable to fetch unread count" });
  }
});

/**
 * DELETE /messages/:messageId
 * Delete a single message
 */
router.delete("/messages/:messageId", requirelogin, async (req, res) => {
  try {
    const message = await MESSAGE.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only sender can delete their message
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized to delete this message" });
    }

    await MESSAGE.findByIdAndDelete(req.params.messageId);

    return res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({ error: "Unable to delete message" });
  }
});

module.exports = router;
