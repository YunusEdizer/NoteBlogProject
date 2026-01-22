const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

// MongoDB & Models
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Message = require('./models/Message');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- MIDDLEWARES ---
app.set('view engine', 'ejs');
app.set('trust proxy', 1); // Trust first proxy (Azure Load Balancer)
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Production Security & Performance
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(compression());

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// XSS Protection Helper
const escapeHtml = (text) => {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
};

// --- NOTIFICATION HELPER ---
const createNotification = async (targetUserId, type, message, link) => {
    try {
        const user = await User.findOne({ id: targetUserId });
        if (user) {
            user.notifications.unshift({
                id: uuidv4(),
                type,
                message,
                link,
                read: false,
                date: new Date()
            });
            // Keep max 20 notifications
            if (user.notifications.length > 20) user.notifications.pop();
            await user.save();
        }
    } catch (err) {
        console.error('Notification Error:', err);
    }
};

// --- AUTH MIDDLEWARE ---
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.escapeHtml = escapeHtml;

    // Category Color Helper
    res.locals.getCategoryColor = (category) => {
        const colors = {
            'Teknoloji': 'primary', // Blue
            'Kariyer': 'warning',   // Yellow/Orange
            'Yaşam': 'success',     // Green
            'Seyehat': 'danger',    // Red
            'Sağlık': 'info',       // Cyan
            'Eğitim': 'secondary',  // Grey
            'Yazılım': 'dark'       // Black
        };
        return colors[category] || 'primary'; // Default blue
    };

    next();
});

const isAuthenticated = (req, res, next) => {
    if (req.session.user) next();
    else res.redirect('/login');
};

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') next();
    else res.status(403).send('Bu sayfaya erişim yetkiniz yok.');
};

// --- ROUTES ---

// 1. HOME
app.get('/', async (req, res) => {
    try {
        const category = req.query.category;
        let query = {};
        if (category) query.category = category;

        const posts = await Post.find(query).sort({ createdAt: -1 });

        // Get top 3 liked posts
        // Note: Sort in memory or use aggregation for array length sort
        const topPosts = await Post.find({}).lean();
        topPosts.sort((a, b) => (b.likes || []).length - (a.likes || []).length);
        const top3 = topPosts.slice(0, 3);

        res.render('index', { posts, topPosts: top3, activeCategory: category || 'Hepsi' });
    } catch (err) {
        console.error(err);
        res.render('index', { posts: [], topPosts: [], activeCategory: 'Hepsi' });
    }
});

app.get('/about', (req, res) => {
    res.render('about');
});

// CONTACT
app.get('/contact', (req, res) => {
    res.render('contact', { success: null, error: null });
});

app.post('/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    try {
        const newMessage = new Message({
            id: uuidv4(),
            name, email, subject, message
        });
        await newMessage.save();
        res.render('contact', { success: 'Mesajınız başarıyla gönderildi!', error: null });
    } catch (err) {
        console.error(err);
        res.render('contact', { success: null, error: 'Mesaj gönderilemedi.' });
    }
});

// SEARCH
app.get('/search', async (req, res) => {
    const query = req.query.q || '';
    const regex = new RegExp(query, 'i');

    try {
        const posts = await Post.find({
            $or: [{ title: regex }, { content: regex }]
        });
        const users = await User.find({
            $or: [{ fullName: regex }, { skills: regex }]
        });

        res.render('search', { query, posts, users });
    } catch (err) {
        console.error(err);
        res.render('search', { query, posts: [], users: [] });
    }
});

// PROFILE
app.get('/profile/:username', async (req, res) => {
    try {
        const profileUser = await User.findOne({ username: req.params.username });
        if (!profileUser) return res.status(404).render('404', { user: req.session.user });

        const userPosts = await Post.find({ authorUsername: profileUser.username }).sort({ createdAt: -1 });
        res.render('profile', { profileUser, userPosts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// AUTH
app.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            // Convert Mongoose doc to plain object for session
            req.session.user = user.toObject();
            res.redirect('/');
        } else {
            res.render('login', { error: 'Hatalı bilgiler!' });
        }
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Giriş hatası.' });
    }
});

app.get('/register', (req, res) => res.render('register', { error: null }));

app.post('/register', async (req, res) => {
    const { username, password, email, fullName, bio, skills } = req.body;

    // Validation
    if (!username || username.trim().length < 3) return res.render('register', { error: 'Kullanıcı adı en az 3 karakter olmalıdır!' });
    if (!password || password.length < 6) return res.render('register', { error: 'Şifre en az 6 karakter olmalıdır!' });
    if (!fullName || fullName.trim().length < 2) return res.render('register', { error: 'Ad Soyad en az 2 karakter olmalıdır!' });

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) return res.render('register', { error: 'Kullanıcı adı veya email zaten kullanılıyor!' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            id: uuidv4(),
            username,
            password: hashedPassword,
            email,
            fullName,
            bio,
            skills: skills ? skills.split(',').map(s => s.trim()) : []
        });

        await newUser.save();
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.render('register', { error: 'Kayıt sırasında hata oluştu.' });
    }
});

// SETTINGS
app.get('/settings', isAuthenticated, (req, res) => {
    res.render('settings', { user: req.session.user, error: null, success: null });
});

app.post('/settings', isAuthenticated, async (req, res) => {
    const { fullName, email, bio, skills, profileImage, github, linkedin, website, newPassword } = req.body;

    try {
        const user = await User.findOne({ id: req.session.user.id });
        if (!user) return res.redirect('/logout');

        // Basic Validation
        if (!fullName || fullName.trim().length < 2) return res.render('settings', { user: req.session.user, error: 'İsim çok kısa.', success: null });

        // Check Email Uniqueness
        if (email && email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) return res.render('settings', { user: req.session.user, error: 'Email kullanımda.', success: null });
        }

        user.fullName = fullName;
        user.email = email;
        user.bio = bio;
        user.skills = skills ? skills.split(',').map(s => s.trim()) : [];
        user.profileImage = profileImage;
        user.social = { github, linkedin, website };

        if (newPassword && newPassword.trim() !== '') {
            if (newPassword.length < 6) return res.render('settings', { user: req.session.user, error: 'Şifre çok kısa.', success: null });
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();
        req.session.user = user.toObject(); // Update session
        res.render('settings', { user: user.toObject(), error: null, success: 'Profil güncellendi.' });
    } catch (err) {
        console.error(err);
        res.render('settings', { user: req.session.user, error: 'Güncelleme hatası.', success: null });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

// NOTIFICATIONS READ
app.get('/notifications/read/:id', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findOne({ id: req.session.user.id });
        if (user) {
            const notif = user.notifications.find(n => n.id === req.params.id);
            if (notif) notif.read = true;
            await user.save();
            req.session.user = user.toObject();

            if (notif && notif.link) res.redirect(notif.link);
            else res.redirect('/');
        } else {
            res.redirect('/');
        }
    } catch (err) {
        res.redirect('/');
    }
});

// CRUD - CREATE
app.get('/create', isAuthenticated, (req, res) => res.render('create', { error: null }));

app.post('/create', isAuthenticated, async (req, res) => {
    const { title, summary, content, image, category } = req.body;

    if (!title || title.length < 3) return res.render('create', { error: 'Başlık kısa.' });
    if (!content || content.length < 10) return res.render('create', { error: 'İçerik kısa.' });

    try {
        const newPost = new Post({
            id: uuidv4(),
            title: title.trim(),
            summary: summary || '',
            content: content.trim(),
            image: image || 'https://via.placeholder.com/800x400',
            category,
            authorUsername: req.session.user.username,
            authorName: req.session.user.fullName
        });

        await newPost.save();
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('create', { error: 'Oluşturma hatası.' });
    }
});

// EDIT
app.get('/edit/:id', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findOne({ id: req.params.id });
        if (!post) return res.status(404).render('404', { user: req.session.user });

        if (req.session.user.role !== 'admin' && post.authorUsername !== req.session.user.username) {
            return res.status(403).send('Yetkisiz.');
        }

        res.render('edit', { post, error: null });
    } catch (err) {
        res.status(500).send('Error');
    }
});

app.post('/edit/:id', isAuthenticated, async (req, res) => {
    const { title, summary, content, image, category } = req.body;
    try {
        const post = await Post.findOne({ id: req.params.id });
        if (!post) return res.status(404).render('404', { user: req.session.user });

        if (req.session.user.role !== 'admin' && post.authorUsername !== req.session.user.username) {
            return res.status(403).send('Yetkisiz.');
        }

        post.title = title;
        post.summary = summary;
        post.content = content;
        post.image = image;
        post.category = category;

        await post.save();
        res.redirect('/profile/' + req.session.user.username);
    } catch (err) {
        console.error(err);
        res.render('edit', { post: {}, error: 'Güncelleme hatası' });
    }
});

// DELETE
app.get('/delete/:id', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findOne({ id: req.params.id });
        if (!post) return res.status(404).render('404', { user: req.session.user });

        if (req.session.user.role !== 'admin' && post.authorUsername !== req.session.user.username) {
            return res.status(403).send('Yetkisiz.');
        }

        await Post.deleteOne({ id: req.params.id });
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// SAVE/UNSAVE
app.post('/save/:id', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findOne({ id: req.session.user.id });
        if (!user.savedPosts) user.savedPosts = []; // Initialize if missing

        if (!user.savedPosts.includes(req.params.id)) {
            user.savedPosts.push(req.params.id);
            await user.save();
            req.session.user = user.toObject();
        }
        res.redirect('/post/' + req.params.id); // Explicit redirect fix
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
});

app.post('/unsave/:id', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findOne({ id: req.session.user.id });
        if (!user.savedPosts) user.savedPosts = []; // Initialize if missing

        user.savedPosts = user.savedPosts.filter(id => id !== req.params.id);
        await user.save();
        req.session.user = user.toObject();
        res.redirect('/post/' + req.params.id); // Explicit redirect fix
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
});

app.get('/saved', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findOne({ id: req.session.user.id });
        const savedPosts = await Post.find({ id: { $in: user.savedPosts } });
        res.render('saved', { savedPosts });
    } catch (err) {
        res.render('saved', { savedPosts: [] });
    }
});

// POST DETAIL & VIEWS
app.get('/post/:id', async (req, res) => {
    try {
        const post = await Post.findOne({ id: req.params.id });
        if (!post) return res.status(404).render('404', { user: req.session.user });

        // Increment Views
        post.views = (post.views || 0) + 1;
        await post.save();

        const wordCount = post.content.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);

        // Fetch Related Posts (Same Category, exclude current)
        const relatedPosts = await Post.find({
            category: post.category,
            id: { $ne: post.id }
        }).limit(3);

        res.render('post', { post, readingTime, relatedPosts, req });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

// SOCIAL INTERACTIONS

// FOLLOW
app.post('/follow/:id', isAuthenticated, async (req, res) => {
    const targetUserId = req.params.id;
    const currentUserId = req.session.user.id;

    if (targetUserId === currentUserId) return res.redirect('back');

    try {
        const targetUser = await User.findOne({ id: targetUserId });
        const currentUser = await User.findOne({ id: currentUserId });

        if (!targetUser.followers.includes(currentUserId)) {
            targetUser.followers.push(currentUserId);
            currentUser.following.push(targetUserId);

            await targetUser.save();
            await currentUser.save();
            await createNotification(targetUserId, 'follow', `${currentUser.fullName} seni takip etmeye başladı.`, `/profile/${currentUser.username}`);

            req.session.user = currentUser.toObject();
        }
        res.redirect(`/profile/${targetUser.username}`);
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
});

// UNFOLLOW
app.post('/unfollow/:id', isAuthenticated, async (req, res) => {
    const targetUserId = req.params.id;
    const currentUserId = req.session.user.id;

    try {
        const targetUser = await User.findOne({ id: targetUserId });
        const currentUser = await User.findOne({ id: currentUserId });

        targetUser.followers = targetUser.followers.filter(id => id !== currentUserId);
        currentUser.following = currentUser.following.filter(id => id !== targetUserId);

        await targetUser.save();
        await currentUser.save();

        req.session.user = currentUser.toObject();
        res.redirect(`/profile/${targetUser.username}`);
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
});

// LIKE
app.post('/like/:id', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findOne({ id: req.params.id });
        const userId = req.session.user.id;

        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter(id => id !== userId);
        } else {
            post.likes.push(userId);
            // Notify
            const author = await User.findOne({ username: post.authorUsername });
            if (author && author.id !== userId) {
                await createNotification(author.id, 'like', `${req.session.user.fullName} yazını beğendi.`, `/post/${post.id}`);
            }
        }
        await post.save();
        res.redirect('back');
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
});

// COMMENT
app.post('/comment/:id', isAuthenticated, async (req, res) => {
    const { text } = req.body;
    try {
        const post = await Post.findOne({ id: req.params.id });
        post.comments.push({
            id: uuidv4(),
            userId: req.session.user.id,
            username: req.session.user.username,
            fullName: req.session.user.fullName,
            text: text,
            date: new Date()
        });

        await post.save();

        // Notify
        const author = await User.findOne({ username: post.authorUsername });
        if (author && author.id !== req.session.user.id) {
            await createNotification(author.id, 'comment', `${req.session.user.fullName} yazına yorum yaptı.`, `/post/${post.id}`);
        }

        res.redirect(`/post/${post.id}`);
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
});

// ADMIN DASHBOARD
app.get('/admin', isAdmin, async (req, res) => {
    const posts = await Post.find({});
    const users = await User.find({});
    const messages = await Message.find({}).sort({ createdAt: -1 }); // Get all messages
    res.render('admin/dashboard', { posts, users, messages });
});

app.use((req, res) => res.status(404).render('404', { user: req.session.user }));

app.listen(PORT, () => console.log(`Sunucu http://localhost:${PORT} portunda yayında.`));
