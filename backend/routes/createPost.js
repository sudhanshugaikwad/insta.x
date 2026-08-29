const express =require("express")
const mongoose = require("mongoose");
const router = express.Router()
const requirelogin = require("../middleware/requirelogin");
const POST = mongoose.model("POST")
const USER = mongoose.model("USER")



// Route
// show all data from database on the instaclone (public - no auth required)
router.get("/allposts", (req, res) => {
    POST.find()
        .populate("postedBy", "_id name userName Photo")
        .populate("likes", "_id name userName Photo")          // ← added
        .populate("comments.postedBy", "_id name userName Photo")
        .sort({ createdAt: -1 })
        .then(posts => res.json(posts))
        .catch(err => {
            console.error("Unable to load posts:", err)
            res.status(500).json({ error: "Unable to load posts" })
        })
})

// Create post with multiple photos
router.post("/createPost", requirelogin, (req, res) => {
    const { body, photos } = req.body;

    // Validate input
    if (!body || !photos || !Array.isArray(photos) || photos.length === 0) {
        return res.status(422).json({ error: "Please add post description and at least one photo" });
    }

    if (photos.length < 3 || photos.length > 5) {
        return res.status(422).json({ error: "Please upload between 3 to 5 photos" });
    }

    // Validate that all photos are valid strings (base64 or URLs)
    if (!photos.every(photo => typeof photo === 'string' && photo.trim().length > 0)) {
        return res.status(422).json({ error: "All photos must be valid strings" });
    }

    try {
        const post = new POST({
            body: body.trim(),
            photos: photos,
            postedBy: req.user._id
        });

        post.save().then((result) => {
            return res.status(201).json({ post: result });
        }).catch(err => {
            console.error("Error saving post:", err);
            res.status(422).json({ error: "Unable to create post" });
        });
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(422).json({ error: "Unable to create post" });
    }
})

router.get("/myposts", requirelogin, (req, res) => {
    POST.find({ postedBy: req.user._id })
        .populate("postedBy", "_id name userName Photo")
        .populate("comments.postedBy", "_id name userName Photo")
        .sort({ createdAt: -1 })
        .then(myposts => {
            res.json(myposts)
        })
        .catch(err => {
            console.error("Error loading user posts:", err);
            res.status(500).json({ error: "Unable to load posts" });
        })
})

router.get("/post/:postId/comments", requirelogin, async (req, res) => {
    try {
        const post = await POST.findById(req.params.postId)
            .select("comments")
            .populate("comments.postedBy", "_id name userName Photo")
        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }
        return res.json({ comments: post.comments })
    } catch (err) {
        return res.status(500).json({ error: "Unable to load comments" })
    }
})


router.put("/unlike", requirelogin, async (req, res) => {
    try {
        const post = await POST.findById(req.body.postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if not already liked
        if (!post.likes.includes(req.user._id)) {
            return res.status(422).json({ error: "Post not liked yet" });
        }

        const result = await POST.findByIdAndUpdate(
            req.body.postId,
            {
                $pull: { likes: req.user._id }
            },
            {
                new: true
            }
        )
        .populate("postedBy", "_id name userName Photo")
        .populate("likes", "_id name userName Photo")
        .populate("comments.postedBy", "_id name userName Photo");

        // Delete notification
        const NOTIFICATION = mongoose.model("NOTIFICATION");
        await NOTIFICATION.deleteOne({
            userId: post.postedBy,
            actorId: req.user._id,
            type: "like",
            postId: req.body.postId,
        });

        res.json(result);
    } catch (err) {
        return res.status(422).json({ error: err });
    }
});

router.put("/like", requirelogin, async (req, res) => {
    try {
        const post = await POST.findById(req.body.postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if already liked
        if (post.likes.includes(req.user._id)) {
            return res.status(422).json({ error: "Post already liked" });
        }

        const result = await POST.findByIdAndUpdate(
            req.body.postId,
            {
                $push: { likes: req.user._id }
            },
            {
                new: true
            }
        )
        .populate("postedBy", "_id name userName Photo")
        .populate("likes", "_id name userName Photo")
        .populate("comments.postedBy", "_id name userName Photo");

        // Create notification if liker is not the post owner
        if (post.postedBy.toString() !== req.user._id.toString()) {
            const NOTIFICATION = mongoose.model("NOTIFICATION");
            await NOTIFICATION.create({
                userId: post.postedBy,
                actorId: req.user._id,
                type: "like",
                postId: req.body.postId,
                message: `liked your post`,
            });
        }

        res.json(result);
    } catch (err) {
        return res.status(422).json({ error: err });
    }
});


router.put("/comment", requirelogin, async (req, res) => {
    try {
        const comment = {
            comment: req.body.text,
            postedBy: req.user._id
        }

        const post = await POST.findById(req.body.postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const result = await POST.findByIdAndUpdate(req.body.postId, {
            $push: { comments: comment }
        }, {
            new: true
        })
        .populate("comments.postedBy", "_id name userName Photo")
        .populate("postedBy", "_id name userName Photo");

        // Create notification if commenter is not the post owner
        if (post.postedBy.toString() !== req.user._id.toString()) {
            const NOTIFICATION = mongoose.model("NOTIFICATION");
            await NOTIFICATION.create({
                userId: post.postedBy,
                actorId: req.user._id,
                type: "comment",
                postId: req.body.postId,
                message: `commented on your post`,
            });
        }

        res.json(result);
    } catch (err) {
        res.status(422).json({ error: err.message });
    }
});

// Edit post - only owner can edit
router.put("/editPost/:postId", requirelogin, async (req, res) => {
    const { body, photos } = req.body;
    const { postId } = req.params;

    try {
        const post = await POST.findById(postId);
        
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if user is the post owner
        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You can only edit your own posts" });
        }

        // Validate input
        if (body !== undefined && body !== null && !body.trim()) {
            return res.status(422).json({ error: "Post body cannot be empty" });
        }

        if (photos && Array.isArray(photos)) {
            if (photos.length < 3 || photos.length > 5) {
                return res.status(422).json({ error: "Please upload between 3 to 5 photos" });
            }
            if (!photos.every(photo => typeof photo === 'string' && photo.trim().length > 0)) {
                return res.status(422).json({ error: "All photos must be valid strings" });
            }
        }

        // Update post
        if (body !== undefined && body !== null) {
            post.body = body.trim();
        }
        if (photos && Array.isArray(photos)) {
            post.photos = photos;
        }

        const updatedPost = await post.save();
        await updatedPost.populate("postedBy", "_id name userName Photo");
        await updatedPost.populate("comments.postedBy", "_id name userName Photo");

        res.json({ post: updatedPost, message: "Post updated successfully" });
    } catch (err) {
        console.error("Error editing post:", err);
        res.status(500).json({ error: "Unable to edit post" });
    }
});

// Delete post - only owner can delete
router.delete("/deletePost/:postId", requirelogin, async (req, res) => {
    const { postId } = req.params;

    try {
        const post = await POST.findById(postId);
        
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if user is the post owner
        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You can only delete your own posts" });
        }

        await POST.findByIdAndDelete(postId);
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ error: "Unable to delete post" });
    }
});

// to uploade profile pick
router.put("/uploadProfilePic",requirelogin,(req,res)=>{
    USER.findByIdAndUpdate(req.user._id,{
        $set:{Photo:req.body.pic}
    },{
        new:true
    }).then((result)=>res.json(result))
      .catch((err)=>res.status(422).json({error:err.message}))
})





module.exports = router