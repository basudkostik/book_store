const express = require('express');
const db = require('./db');
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
    res.render('index', { searchTerm: '' });  
});


app.get("/books", (req, res) => {
    let query = "SELECT * FROM books WHERE 1=1"; 
    let params = [];

    const { genre, minPrice, maxPrice, q } = req.query;

    if (genre) {
        query += " AND genre = ?";
        params.push(genre);
    }

    if (minPrice) {
        query += " AND price >= ?";
        params.push(minPrice);
    }

    if (maxPrice) {
        query += " AND price <= ?";
        params.push(maxPrice);
    }

    if (q) {
        query += " AND (book_name LIKE ? OR author LIKE ?)";
        params.push(`%${q}%`, `%${q}%`); // İki tane LIKE araması için 2 parametre
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Sunucu hatası");
        } else {
            res.render("books", {
                books: results,
                searchTerm: q || '', // input kutusunda görünsün
                genre: genre || '',
                minPrice: minPrice || '',
                maxPrice: maxPrice || ''
            });
        }
    });
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
