const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Keeping UUID for backward compatibility
    title: { type: String, required: true },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: '' },
    category: { type: String, required: true },
    authorUsername: { type: String, required: true },
    authorName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    likes: { type: [String], default: [] }, // Array of User IDs
    comments: [{
        id: String,
        userId: String,
        username: String,
        fullName: String,
        text: String,
        date: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('Post', postSchema);
