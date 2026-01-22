# 🚀 NoteBlog Project - Profesyonel Blog Platformu

**NoteBlog**, modern web teknolojileri kullanılarak geliştirilmiş, tam kapsamlı (Full-Stack) bir blog uygulamasıdır. Kullanıcıların içerik üretebildiği, etkileşime girebildiği ve yöneticilerin siteyi kontrol edebildiği dinamik bir yapıya sahiptir.

🔗 **Canlı Demo:** [https://noteblog-ctgpcke8hpcmbnf4.germanywestcentral-01.azurewebsites.net](https://noteblog-ctgpcke8hpcmbnf4.germanywestcentral-01.azurewebsites.net)

---

## 🌟 Proje Hakkında

Bu proje, **Node.js** ve **MongoDB** kullanılarak **MVC (Model-View-Controller)** mimarisine uygun olarak geliştirilmiştir. Sadece bir blog değil, aynı zamanda güvenli bir üyelik sistemi, yönetim paneli ve sosyal etkileşim özelliklerini barındırır.

### Temel Özellikler

*   **🔐 Güvenli Kimlik Doğrulama:** Kayıt olma, giriş yapma ve çıkış işlemleri (Bcrypt şifreleme).
*   **📝 CRUD İşlemleri:** Kullanıcılar kendi yazılarını oluşturabilir, düzenleyebilir ve silebilir.
*   **💬 Etkileşim:** Yazılara yorum yapma, beğenme (Like) ve kaydetme (Bookmark) özellikleri.
*   **📊 Admin Paneli:** Site istatistiklerini görüntüleme, kullanıcıları yönetme ve gelen mesajları okuma.
*   **🎨 Dinamik Tasarım:** Kategorilere özel renk etiketleri, mobil uyumlu (Responsive) arayüz.
*   **🔍 Arama ve İstatistikler:** Site içi arama motoru, yazı görüntülenme sayıları ve tahmini okuma süreleri.
*   **☁️ Bulut Tabanlı:** MongoDB Atlas veritabanı ve Microsoft Azure barındırma.

---

## 🛠️ Teknolojiler

Bu projede aşağıdaki teknolojiler kullanılmıştır:

*   **Backend:** Node.js, Express.js
*   **Veritabanı:** MongoDB (Mongoose ODM)
*   **Frontend:** EJS (Template Engine), Bootstrap 5, CSS3
*   **Güvenlik:** Helmet, Bcryptjs, Express-Session
*   **Deploy:** Microsoft Azure App Service

---

## 📂 Proje Yapısı (MVC)

Proje, endüstri standartlarına uygun olarak modüler bir yapıda kodlanmıştır:

```
NoteBlogProject/
├── models/         # Veritabanı şemaları (User, Post, Message)
├── views/          # Kullanıcı arayüzü dosyaları (EJS)
│   ├── partials/   # Tekrar eden parçalar (Header, Footer)
│   └── admin/      # Yönetim paneli sayfaları
├── public/         # Statik dosyalar (CSS, Resimler, JS)
├── app.js          # Ana sunucu dosyası ve rotalar (Controller)
└── .env            # Gizli ortam değişkenleri
```

---

## 🚀 Kurulum (Local)

Projeyi kendi bilgisayarınızda çalıştırmak için:

1.  **Depoyu İndirin:**
    ```bash
    git clone https://github.com/KULLANICI_ADINIZ/NoteBlogProject.git
    cd NoteBlogProject
    ```

2.  **Paketleri Yükleyin:**
    ```bash
    npm install
    ```

3.  **Çevresel Değişkenleri Ayarlayın:**
    Ana dizinde `.env` dosyası oluşturun ve aşağıdaki bilgileri girin:
    ```env
    MONGO_URI=mongodb+srv://kullanici:sifre@cluster.mongodb.net/blog
    SESSION_SECRET=gizlisifreniz
    PORT=3000
    ```

4.  **Başlatın:**
    ```bash
    npm start
    ```
    Tarayıcınızda `http://localhost:3000` adresine gidin.

---

## 👤 Yazar

**Yunus Emre Edizer**
*   Yazılım Geliştirici & Tasarımcı
*   Proje Tarihi: Ocak 2026

---
*Bu proje eğitim amaçlı geliştirilmiştir.*
