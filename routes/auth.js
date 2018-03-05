var auth = function(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/api/unauthorized')
}

module.exports = auth;