const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// EJS motorunu ayarla
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Statik dosyaları sun (CSS, JS, resimler)
app.use(express.static(path.join(__dirname, 'public')));

// Anasayfa rotası
app.get('/', (req, res) => {
    res.render('index');
});


app.get("/result", (req, res) => {
    const searchTerm = req.query.q;
    res.render("result", { searchTerm });
});
// Ürün arama rotası


app.get("/books", (req, res) => {
    res.render("books"); // books.ejs dosyasını render et
});

// Giriş yap sayfası (örnek)
app.get('/login', (req, res) => {
    res.render('login'); // views/login.ejs olmalı
});

// Sepet sayfası (örnek)
app.get('/sepet', (req, res) => {
    res.render('cart'); // views/cart.ejs olmalı
});

// Favori listesi (örnek)
app.get('/favoriler', (req, res) => {
    res.render('favorites'); // views/favorites.ejs olmalı
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
