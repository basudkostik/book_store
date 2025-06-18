


function addToCart(bookId) {

    if (!currentUserId) {
        return window.location.href = "/login";
    }

    fetch('/api/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookId })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || 'Kitap sepete eklendi!');
    })
    .catch(error => {
        console.error('Sepete eklerken hata oluştu:', error);
        alert('Hata oluştu');
    });
}

// Kitabı favorilere ekle
function addToFavorites(bookId) {
    if (!currentUserId) {
        openLoginModal();
        return;
    }
    
    fetch('/api/favorites', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookId })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || 'Kitap favorilere eklendi!');
    })
    .catch(error => {
        console.error('Favoriye eklerken hata oluştu:', error);
        alert('Hata oluştu');
    });
}

function deleteBook(bookId, type) {
    const endpoint = type === "cart" ? `/cart/delete/${bookId}` : `/favorites/delete/${bookId}`; // 🔥 Endpoint seçimi

    fetch(endpoint, { method: "DELETE" })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload(); // Sayfayı yenileyerek silinen öğeyi kaldır
        } else {
            alert("Silme işlemi başarısız oldu.");
        }
    })
    .catch(error => console.error("Silme hatası:", error));
}


function logoutUser() {
    fetch('/logout', { method: 'POST' }) // Opsiyonel: Sunucuya logout isteği gönder
        .then(() => {
            sessionStorage.clear(); // 🔥 Tarayıcıda oturum verilerini temizle
            location.reload(); // 🔄 Sayfayı yenile ve logout işlemini tamamla
        })
        .catch(error => console.error("Çıkış hatası:", error));
}

 

function openLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) {
        modal.style.display = "flex";
    } else {
        console.warn("Modal bulunamadı!");
    }
}


function closeLoginModal() {
    document.getElementById("loginModal").style.display = "none";
}
