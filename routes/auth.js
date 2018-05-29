var auth = function(req, res, next) {
    console.log("req.isAuthenticated() " + req.isAuthenticated());
    
    if (req.isAuthenticated()) { 
        console.log("authorized!");
        return next(); 
    }
    console.log("unauthorized!") 
    res.json("{ 'error': 'unauthorized'}");
}

module.exports = auth;