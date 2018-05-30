var mongoose = require('mongoose');
var router = require('express').Router();
var WalletApi = mongoose.model('WalletApi');
const logger = require('../../util/logger');
var isFirebaseAuth = require('../../util/firebase-auth');

router.get('/apps', isFirebaseAuth ,function(req, res, next) {
    WalletApi.find({} ,function (err, auth) {
        if(err) res.status(500).json(err);
        console.log(auth);
        if(auth != null){
            return res.status(200).json(auth);
        }
    });
});


router.get('/:apitoken', isFirebaseAuth , function(req, res, next) {
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

router.post('/app', isFirebaseAuth , function(req, res, next) {
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