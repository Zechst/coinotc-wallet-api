'use strict'
var mongoose = require('mongoose');
var router = require('express').Router();
var Wallet = mongoose.model('Wallet');
//var auth = require('../auth');

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

router.get('/wallets/:email', function(req, res, next) {

});

router.get('/wallets/balance', function(req, res, next) {

});


router.get('/wallets/generate/:email/:password', function(req, res, next) {
    var emailAddy = req.params.email;
    var accPassword = req.params.password;
    
    Wallet.findOne({ 'email': emailAddy },function (err, wallet) {
        console.log(err);
        if (err) {
            adaWallet.createWallet(accPassword);
            ethWallet.createWallet(accPassword).then(result => {
                console.log("result" + result);
            });
        }
        console.log(wallet);
    });
});


module.exports = router;
