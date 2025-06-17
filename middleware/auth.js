function authRequired(req, res, next) {
    if (!req.session || !req.session.user_id) {
        return res.redirect('/login'); // Redirect if not authenticated
    }
    next(); // Continue if authenticated
}

module.exports = authRequired;


