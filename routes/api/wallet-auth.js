var mongoose = require('mongoose');
var router = require('express').Router();
var WalletApi = mongoose.model('WalletApi');
const logger = require('../../util/logger');
const admin = require('firebase-admin');
const keys = require(process.env.FIREBASE_JSON_KEYFILENAME);
admin.initializeApp({
  databaseURL: process.env.FIREBASE_DB_URL,
  credential: admin.credential.cert(keys)
});

function isAuthenticate(req,res,next){
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


router.get('/apps', isAuthenticate ,function(req, res, next) {
    WalletApi.find({} ,function (err, auth) {
        if(err) res.status(500).json(err);
        console.log(auth);
        if(auth != null){
            return res.status(200).json(auth);
        }
    });
});


router.get('/:apitoken', isAuthenticate , function(req, res, next) {
    var apiToken = req.params.apitoken;
    console.log("ssssss > " + apiToken);
    WalletApi.findOne({'token':apiToken} ,function (err, auth) {
        if(err) res.status(500).json(err);
        console.log(">>>> " + auth);
        if(auth != null){
            return res.status(200).json(auth);
        }
    });
});

router.post('/app', isAuthenticate , function(req, res, next) {
    let authInfo = req.body;
    console.log("Token > "  + authInfo.token);
    console.log("Name " + authInfo.name);
    WalletApi.findOne({'name':authInfo.name} ,function (err, auth) {
        if(err) res.status(500).json(err);

        if(auth == null){
            var newAuthApp = new WalletApi({
                appname: authInfo.name
            });
            newAuthApp.setApiToken(authInfo.token);
            newAuthApp.save(function(err, newAuthApp){
                console.log();
                if (err) {
                    console.log(err);
                    return res.status(500).json(err);
                }
                if(newAuthApp != null){
                    return res.status(200).json(newAuthApp);
                }
            });
        }
    });
});

module.exports = router;