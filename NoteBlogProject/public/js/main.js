// NoteBlog - Main JavaScript File

document.addEventListener('DOMContentLoaded', function() {
    console.log('NoteBlog Uygulaması Yüklendi');
    
    // Form Validasyonu
    setupFormValidation();
    
    // Search Functionality
    setupSearch();
    
    // Notification Handler
    setupNotifications();
});

/**
 * Form Validasyonu
 */
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('error');
                    isValid = false;
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                alert('Lütfen tüm gerekli alanları doldurunuz.');
            }
        });
    });
}

/**
 * Arama Fonksiyonu
 */
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query.length > 0) {
                    window.location.href = `/search?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }
}

/**
 * Bildirim Handler
 */
function setupNotifications() {
    const notificationBell = document.querySelector('.notification-bell');
    
    if (notificationBell) {
        notificationBell.addEventListener('click', function(e) {
            e.preventDefault();
            const notifications = document.querySelector('.notifications-dropdown');
            if (notifications) {
                notifications.style.display = 
                    notifications.style.display === 'block' ? 'none' : 'block';
            }
        });
    }
    
    // Sayfanın başka yerine tıklanınca dropdown kapat
    document.addEventListener('click', function(e) {
        const notifications = document.querySelector('.notifications-dropdown');
        if (notifications && !e.target.closest('.notification-bell')) {
            notifications.style.display = 'none';
        }
    });
}

/**
 * Post Beğenme/Kaydetme
 */
function toggleLike(postId) {
    const form = document.querySelector(`form[data-post-id="${postId}"][data-action="like"]`);
    if (form) {
        form.submit();
    }
}

function toggleSave(postId) {
    const form = document.querySelector(`form[data-post-id="${postId}"][data-action="save"]`);
    if (form) {
        form.submit();
    }
}

/**
 * Confirm Delete
 */
function confirmDelete(postTitle) {
    return confirm(`'${postTitle}' yazısını silmek istediğinize emin misiniz?`);
}

/**
 * Profile Follow/Unfollow
 */
function toggleFollow(userId, isFollowing) {
    const form = document.querySelector(`form[data-user-id="${userId}"]`);
    if (form) {
        form.submit();
    }
}

/**
 * Yükleme Göstergesi
 */
function showLoading(element) {
    element.style.opacity = '0.6';
    element.disabled = true;
    element.textContent = 'Yükleniyor...';
}

function hideLoading(element, text) {
    element.style.opacity = '1';
    element.disabled = false;
    element.textContent = text;
}

/**
 * Copy to Clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Kopyalandı!');
    }).catch(err => {
        console.error('Kopyalama başarısız:', err);
    });
}

/**
 * Format Tarih
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Export functions for global use
window.toggleLike = toggleLike;
window.toggleSave = toggleSave;
window.confirmDelete = confirmDelete;
window.toggleFollow = toggleFollow;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.copyToClipboard = copyToClipboard;
window.formatDate = formatDate;
