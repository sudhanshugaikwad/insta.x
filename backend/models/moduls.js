
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    Photo: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        index: true
    },
    suspended: {
        type: Boolean,
        default: false,
        index: true
    },
    followers: [{
        type: ObjectId,
        ref: "USER"
    }],
    following: [{
        type: ObjectId,
        ref: "USER"
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

mongoose.model("USER", userSchema)