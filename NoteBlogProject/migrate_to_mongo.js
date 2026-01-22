const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const Post = require('./models/Post');

// --- CONFIGURATION ---
// Replace with your actual connection string if environment variable is not set
const MONGO_URI = "mongodb+srv://edizeryunusemre:Edizer285736..@cluster0.a31c0wm.mongodb.net/?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected for Migration'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Load JSON Data
const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf8'));
const posts = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'posts.json'), 'utf8'));

const migrate = async () => {
    try {
        // Clear existing collections to avoid duplicates during testing
        await User.deleteMany({});
        await Post.deleteMany({});
        console.log('Old data cleared from MongoDB.');

        // Migrate Users
        await User.insertMany(users);
        console.log(`${users.length} users migrated.`);

        // Migrate Posts
        await Post.insertMany(posts);
        console.log(`${posts.length} posts migrated.`);

        console.log('✅ Migration COMPLETED Successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration Failed:', error);
        process.exit(1);
    }
};

migrate();
