# NoteBlog Projesi

**NoteBlog**, teknoloji, kariyer ve yaşam üzerine içeriklerin paylaşıldığı modern, minimalist ve profesyonel bir blog platformudur. Kullanıcıların fikirlerini özgürce paylaşabileceği, etkileşime girebileceği (beğeni, yorum) dinamik bir web uygulamasıdır.

## 🚀 Özellikler

*   **Dinamik İçerik Yönetimi**: Yazı ekleme, düzenleme, silme (CRUD) işlemleri.
*   **Kullanıcı Sistemi**: Kayıt olma, giriş yapma, profil yönetimi.
*   **Etkileşim**: Yazıları beğenme, yorum yapma ve kaydetme özellikleri.
*   **Kategorilendirme**: Teknoloji, Kariyer ve Yaşam kategorilerinde filtreleme.
*   **Responsive Tasarım**: Mobil ve tablet uyumlu modern arayüz (Bootstrap 5).
*   **Güvenlik**: Şifreli parola saklama (BCrypt), XSS koruması (Helmet) ve güvenli oturum yönetimi.

## 🛠️ Teknolojiler

Bu proje aşağıdaki modern web teknolojileri ile geliştirilmiştir:

*   **Backend**: Node.js, Express.js
*   **Frontend**: EJS (Template Engine), Bootstrap 5, Vanilla CSS
*   **Veri Depolama**: JSON Tabanlı Dosya Sistemi (Demo Amaçlı)
*   **Diğer**: UUID, BCryptJS, Dotenv, Helmet, Compression

## 📦 Kurulum (Local)

Projeyi kendi bilgisayarınızda çalıştırmak için:

1.  **Repoyu Klonlayın:**
    ```bash
    git clone https://github.com/kullaniciadi/noteblog.git
    cd noteblog
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Uygulamayı Başlatın:**
    ```bash
    npm start
    ```

4.  **Tarayıcıda Açın:**
    `http://localhost:3000` adresine gidin.

## ☁️ Azure Deployment (Yayınlama)

Bu proje Azure Web Apps üzerinde çalışmaya hazırdır.

1.  VS Code üzerinden "Azure App Service" eklentisi ile deploy edin.
2.  Azure Portal'da `Application Settings` kısmına şu ortam değişkenlerini ekleyin:
    *   `NODE_ENV`: `production`
    *   `SESSION_SECRET`: `(Güçlü bir şifre)`
3.  **Önemli Not**: Veriler JSON dosyasında tutulduğu için, sunucu her yeniden başladığında veriler sıfırlanacaktır (Demo modunda olduğu için).

---
*Geliştirici: Yunus Emre Edizer*
