const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Keeping UUID for backward compatibility
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { type: String, default: 'user' },
    bio: { type: String, default: '' },
    skills: { type: [String], default: [] },
    profileImage: { type: String, default: '' },
    social: {
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        website: { type: String, default: '' }
    },
    followers: { type: [String], default: [] }, // Array of User IDs
    following: { type: [String], default: [] }, // Array of User IDs
    savedPosts: { type: [String], default: [] }, // Array of Post IDs
    notifications: [{
        id: String,
        type: { type: String }, // 'like', 'comment', 'follow'
        message: String,
        link: String,
        read: { type: Boolean, default: false },
        date: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
