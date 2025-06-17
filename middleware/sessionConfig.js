const session = require('express-session');
require('dotenv').config();

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET ,  
    resave: false,
    saveUninitialized: false
});

module.exports = sessionMiddleware;