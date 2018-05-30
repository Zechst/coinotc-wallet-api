const admin = require('firebase-admin');
const keys = require(process.env.FIREBASE_JSON_KEYFILENAME);

admin.initializeApp({
  databaseURL: process.env.FIREBASE_DB_URL,
  credential: admin.credential.cert(keys)
});

var isFirebaseAuth = function (req,res,next){
    console.log(req.headers);
    var origin = req.get('origin');
    console.log("origin " + origin);
    let allowHost = process.env.COINOTC_ALLOWED_HOST;
    let arrAllowHosts = allowHost.split(',');
    console.log("allowHost " + allowHost);
    console.log("arrAllowHosts " + arrAllowHosts);
    let isAllow = false;
    for(var i=0; i <arrAllowHosts.length; i++){
        if(arrAllowHosts[i] === origin){
            console.log("Allowed!");
            isAllow = true;
            break;
        }
    }
    if(!isAllow){
        console.log("Not Allowed!");
        return res.status(403).json({error: 'Access Denied'});
    }
    if(req.headers.authorization != null){
        console.log(req.headers.authorization);
        var authIdToken = req.headers.authorization.split(' ')[1];
        console.log("authIdToken" + authIdToken);
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token' ||
            req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            admin.auth().verifyIdToken(req.headers.authorization.split(' ')[1]).then(function(result){
                if(result != null){
                    req.session.firebaseEmail = result.email;
                    return next();
                }{
                    throw new Error('Firebase unable to verify');
                }
            }).catch(error => {
                console.log(error);
                return res.status(403).json({error: 'Access Denied with firebase verification error'});
            });    
        }else{
            return res.status(403).json({error: 'Access Denied'});
        }
    }else{
        return res.status(403).json({error: 'Access Denied'});
    } 
}
module.exports = isFirebaseAuth;