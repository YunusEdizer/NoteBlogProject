const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const categories = ['Teknoloji', 'Kariyer', 'Yaşam', 'Seyehat', 'Sağlık', 'Eğitim', 'Yazılım'];
const users = [
    { username: 'yunusemre', fullName: 'Yunus Emre Edizer' },
    { username: 'candemir82', fullName: 'Can Demir' },
    { username: 'mustafayılmaz58', fullName: 'Mustafa Yılmaz' },
    { username: 'denizaydın25', fullName: 'Deniz Aydın' },
    { username: 'elifkılıç82', fullName: 'Elif Kılıç' },
    { username: 'emreçelik79', fullName: 'Emre Çelik' },
    { username: 'zeynepaydın55', fullName: 'Zeynep Aydın' }
];

const posts = [];

for (let i = 0; i < 40; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const randomNum = Math.floor(Math.random() * 1000);

    posts.push({
        id: uuidv4(),
        title: `${category} Hakkında İpuçları - ${randomNum}`,
        summary: `Bu yazıda ${category.toLowerCase()} konusuna değiniyoruz. Detaylar için okumaya devam edin.`,
        content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. ${category} hakkında bilmeniz gereken her şey burada. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.`,
        image: `https://picsum.photos/seed/${Math.random()}/800/400`,
        category: category,
        authorUsername: user.username,
        authorName: user.fullName,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
        likes: [],
        comments: [],
        views: Math.floor(Math.random() * 500)
    });
}

fs.writeFileSync(path.join(__dirname, 'data', 'posts.json'), JSON.stringify(posts, null, 2));
console.log('Dummy data restored!');
