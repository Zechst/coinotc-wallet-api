'use strict'
var mongoose = require('mongoose');
var router = require('express').Router();
var Wallet = mongoose.model('Wallet');
//var auth = require('../auth');
const Util = require('../../util');

var CardanoWallet = require('../../wallet/cardano');
var EthereumWallet = require('../../wallet/ethereum');
var MoneroWallet = require('../../wallet/monero');
var RippleWallet = require('../../wallet/ripple');
var StellarWallet = require('../../wallet/stellar');

var adaWallet = new CardanoWallet(null, null);
var ethWallet = new EthereumWallet();
var moneroWallet = new MoneroWallet('localhost', 7878);
var rippleWallet = new RippleWallet();
var stellarWallet = new StellarWallet();

router.get('/:email', function(req, res, next) {
    var email  = req.params.email;
    console.log(email);
});

router.get('/balance/:walletid', function(req, res, next) {
    var walletId  = req.params.walletid;
    console.log(walletId);
});


router.get('/generate/:email/:password', function(req, res, next) {
    var emailAddy = req.params.email;
    var walletGlobalPassword = req.params.password;
    console.log(emailAddy);
    console.log(walletGlobalPassword);
    
    Wallet.findOne({ 'email': emailAddy },function (err, wallet) {
        console.log(err);
        if (err) {
            console.log(err);
        }
        if (wallet == null) {
            console.log("creating wallet ....");
            Wallet.create({ email: emailAddy, eth: {}, monero: {}, cardano: {}, ripple: {}, stellar: {} }, function (err, createdWallet) {
                console.log(wallet);
                if (err) {
                    console.log(err);
                }
                // saved!
                if(createdWallet != null){
                    adaWallet.createWallet(walletGlobalPassword, emailAddy);
                    /*
                    ethWallet.createWallet(walletGlobalPassword, emailAddy).then(result => {
                        console.log("result" + result);
                    });
                    firstWallet = Util.makeid();
                    // potential we need to pass in chinese or english for the wallet language.
                    moneroWallet.createWallet(firstWallet, walletGlobalPassword, 'English', emailAddy).then(function(result){
                        console.log(result);
                    });
                    rippleWallet.generate(emailAddy);
                    stellarWallet.generate(emailAddy);*/
                }
                
                return res.json(createdWallet);
            })
        }else{
            return res.json(wallet);
        }
    })
});


module.exports = router;
