const express = require('express');
const sessionMiddleware = require('./middleware/sessionConfig');
const db = require('./db');
const path = require('path');
const bcrypt = require('bcrypt');
const { error } = require('console');


const app = express();
const PORT = 3000;
app.use(express.json());
app.use(sessionMiddleware);

// EJS motorunu ayarla
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Statik dosyaları sun (CSS, JS, resimler)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Anasayfa rotası
app.get('/', (req, res) => {
    res.render('index', { searchTerm: '' , 
        userId : req.session.user_id || null  , 
        username: req.session.username || null ,
        query : req.query  });  
});


app.get("/books", (req, res) => {
    let query = "SELECT * FROM books WHERE 1=1"; 

    
    let params = [];

   const { genre, author , language, minPrice, maxPrice, minPages, maxPages, minRating, maxRating, minYear, maxYear, q } = req.query;

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


    if (language) {
        query += " AND language = ?";
        params.push(language);
    }

    if (minPages) {
        query += " AND pages >= ?";
        params.push(minPages);
    }

    if (maxPages) {
        query += " AND pages <= ?";
        params.push(maxPages);
    }

    if (minRating) {
        query += " AND rating >= ?";
        params.push(minRating);
    }

    if (maxRating) {
        query += " AND rating <= ?";
        params.push(maxRating);
    }

    if (minYear) {
        query += " AND published_year >= ?";
        params.push(minYear);
    }

    if (maxYear) {
        query += " AND published_year <= ?";
        params.push(maxYear);
    }

    if(author) {
        query += " AND author = ?";
        params.push(author);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Sunucu hatası");
        } else {
            res.render("books", {
                books: results,
                author: author || null,
                searchTerm: q || '',
                genre: genre || '',
                minPrice: minPrice || '',
                maxPrice: maxPrice || null,
                language: language || '',
                minPages: minPages || '',
                maxPages: maxPages || '',
                minRating: minRating || '',
                maxRating: maxRating || '',
                minYear: minYear || '',
                maxYear: maxYear || '',
                userId: req.session.user_id || null,
                username: req.session.username || null
            });
        }
    });
});


app.post('/api/cart', (req, res) => {
    const bookId = req.body.bookId;
    const userId = req.session.user_id;

    if (!userId) {
        return res.status(401).json({ message: "Giriş yapmalısınız." });
    }

    if (!bookId) {
        return res.status(400).json({ message: "Geçersiz kitap ID" });
    }

    const query = "INSERT IGNORE INTO cart (user_id, book_id) VALUES (?, ?)";

    db.query(query, [userId, bookId], (err) => {
        if (err) {
            console.error("Veritabanı hatası:", err);
            return res.status(500).json({ message: "Kitap sepete eklenirken hata oluştu" });
        }

        res.json({ message: "Kitap sepete başarıyla eklendi!" });
    });
});


app.get('/cart', (req, res) => {
    const userId = req.session.user_id;

    if (!userId) {
        return res.redirect('/login'); 
    }

    const query = `
        SELECT b.id, b.book_name, b.author, b.price, b.genre 
        FROM cart c
        JOIN books b ON c.book_id = b.id
        WHERE c.user_id = ?
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Sepet verisi alınamadı:", err);
            return res.status(500).send("Sunucu hatası");
        }

        res.render('cart', { books: results, 
            searchTerm: '' , 
            username: req.session.username || null,
            userId: req.session.user_id || null });
    });
});

app.post('/api/favorites', (req, res) => {
    const bookId = req.body.bookId;
    const userId = req.session.user_id;

    if (!userId) {
        return res.status(401).json({ message: "Giriş yapmalısınız." });
    }

    if (!bookId) {
        return res.status(400).json({ message: "Geçersiz kitap ID" });
    }

    const query = "INSERT IGNORE INTO favorites (user_id, book_id) VALUES (?, ?)";

    db.query(query, [userId, bookId], (err) => {
        if (err) {
            console.error("Veritabanı hatası:", err);
            return res.status(500).json({ message: "Kitap favorilere eklenirken hata oluştu" });
        }

        res.json({ message: "Kitap favorilere başarıyla eklendi!" });
    });
});

app.get('/favorites', (req, res) => {
    const userId = req.session.user_id;

    if (!userId) {
        return res.redirect('/login'); 
    }

    const query = 'SELECT b.id, b.book_name, b.author, b.price, b.genre FROM favorites f JOIN books b ON f.book_id = b.id WHERE f.user_id = ?';

     db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Favori verisi alınamadı:", err);
            return res.status(500).send("Sunucu hatası");
        }

        res.render('favorites', { books: results, 
            searchTerm: '' , 
            username: req.session.username || null,
            userId: req.session.user_id || null });
    });

});


app.delete('/cart/delete/:id', (req, res) => {
    const bookId = req.params.id;

    db.query("DELETE FROM cart WHERE book_id = ?", [bookId], (err, result) => {
        if (err) {
            console.error("Sepetten silme hatası:", err);
            return res.json({ success: false });
        }
        res.json({ success: true });
    });
});

app.delete('/favorites/delete/:id', (req, res) => {
    const bookId = req.params.id;

    db.query("DELETE FROM favorites WHERE book_id = ?", [bookId], (err, result) => {
        if (err) {
            console.error("Favorilerden silme hatası:", err);
            return res.json({ success: false });
        }
        res.json({ success: true });
    });
});



app.get('/login', (req, res) => {
    res.render('login' , {searchTerm : '' ,username: req.session.username || null,
            userId: req.session.user_id || null});  
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('login', { error: "E-posta ve şifre gerekli!" });
    }

    const query = "SELECT * FROM users WHERE user_email = ?";

    db.query(query, [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.render('login', { error: "Kullanıcı bulunamadı!" });
        }

        console.log("Oturum bilgileri:", req.session); 
        const user = results[0];

        // Şifre karşılaştırma
        const isMatch = await bcrypt.compare(password, user.user_password); // 🔑 Hash ile karşılaştırma

        if (!isMatch) {
            return res.render('login', { error: "Şifre hatalı!" });
        }

        req.session.user_id = user.user_id;
        req.session.username = user.user_name;

        console.log("Giriş yapan kullanıcı:", user.user_name);
        console.log("Oturum bilgileri:", user.user_id);

        res.redirect('/');  
    });
});

app.get('/register', (req, res) => {
    res.render('register' , { userId: req.session.user_id || null , searchTerm : ''} ); 
});

app.post('/register', async (req, res) => {
     console.log(req.body);
    const { username, email, password } = req.body;

    // Kullanıcı adı, e-posta ve şifre kontrolü
    if (!username || !email || !password) {
        return res.render('register', { error: "Tüm alanları doldurmalısınız!" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); 

        const query = "INSERT INTO users (user_name, user_email, user_password) VALUES (?, ?, ?)";
        
        db.query(query, [username, email, hashedPassword], (err) => {
            if (err) {
                console.error("Kayıt hatası:", err);
                return res.render('register', { error: "Bu e-posta zaten kullanımda!" });
            }

            res.redirect('/login'); // ✅ Kayıt başarılıysa login sayfasına yönlendir
        });

    } catch (error) {
        console.error("Hashleme hatası:", error);
        res.render('register', { error: "Bir hata oluştu, tekrar deneyin!"  });
    }
});


app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true }); // 🔥 Başarı mesajı döndür
    });
});


app.post('/checkout', async (req, res) => {
  const { totalPrice, cardNumber, expiry, cvv } = req.body;
  const userId = req.session.user_id; 

  
  if (!cardNumber || !expiry || !cvv) {
    return res.status(400).send("Kart bilgileri eksik.");
  }
  try {
    console.log("Kullanıcı ID:", userId);
   await db.promise().query('DELETE FROM cart WHERE user_id = ?', [userId]);
   res.redirect('/?success=1');
  } catch (err) {
    console.error(err);
    res.status(500).send("Ödeme sırasında bir hata oluştu.");
  }
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
