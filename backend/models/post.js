const mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema.Types

const postSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    },
    photos: [{
        type: String,
        required: true
    }],
    likes: [{
        type: ObjectId,
        ref: "USER"
    }],
    comments: [{
        comment: { type: String },
        postedBy: { type: ObjectId, ref: "USER" }
    }],
    postedBy: {
        type: ObjectId,
        ref: "USER",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

mongoose.model("POST", postSchema)
