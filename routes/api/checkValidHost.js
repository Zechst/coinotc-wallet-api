var checkValidHost = function(req, res, next) {
    var origin = req.get('origin');
    console.log("origin " + origin);
    let allowHost = process.env.COINOTC_ALLOWED_HOST;
    let arrAllowHosts = allowHost.split(',');
    console.log("allowHost " + allowHost);
    console.log("arrAllowHosts " + arrAllowHosts);
    for(var i=0; i <arrAllowHosts.length; i++){
        if(arrAllowHosts[i] === origin){
            console.log("Allowed!");
            return next();
        }
    }
    console.log("Not Allowed!");
    return res.status(403).json({error: 'Access Denied'});
}    

module.exports = checkValidHost;