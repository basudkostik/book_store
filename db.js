require('dotenv').config(); // dotenv paketini yükle

const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('❌ MySQL bağlantı hatası:', err);
    } else {
        console.log('✅ MySQL bağlantısı başarılı!');
    }
});

module.exports = db;
