'use strict'
var mongoose = require('mongoose');
var router = require('express').Router();
var Wallet = mongoose.model('Wallet');
var bluebird = require("bluebird");
//var auth = require('../auth');
const Util = require('../../util');
const evtEmitter = require('../../util/evtemitter');
const logger = require('../../util/logger');
var ethers = require('ethers');

var CardanoWallet = require('../../wallet/cardano');
var EthereumWallet = require('../../wallet/ethereum');
var MoneroWallet = require('../../wallet/monero');
var RippleWallet = require('../../wallet/ripple');
var StellarWallet = require('../../wallet/stellar');

var adaWallet = new CardanoWallet(null, null);
var ethWallet = new EthereumWallet();
var moneroWallet = new MoneroWallet(process.env.MONERO_HOSTNAME, process.env.MONERO_PORT);
var rippleWallet = new RippleWallet();
var stellarWallet = new StellarWallet();

const utils = new Util();
var moneroAccInfo = {
    name: '',
    balance: 0,
    accInfo: [],
    password: '',
    language: 'English',
    email: ''
}

router.get('/:email', function(req, res, next) {
    var emailAddy  = req.params.email;
    logger.debug(emailAddy);
    Wallet.findOne({ 'email': emailAddy },function (err, wallet) {
        if(err) res.status(500).json(err);
        return res.status(200).json(wallet);
    });
});

router.get('/balance/:walletid/:type', function(req, res, next) {
    var walletId  = req.params.walletid;
    var walletType  = req.params.type.toUpperCase();

    logger.debug(walletId);
    logger.debug(walletType);
    
    Wallet.findById(walletId, function(err, wallet){
        if(err) res.status(500).json(err);
        console.log(">>>" + wallet);
        if('ETH' === walletType){
            console.log(wallet.eth.privateKey);
            ethWallet.balance(wallet.eth.privateKey).then(bal => {
                logger.debug("-> balance -> result - > " + bal);
                logger.debug("In ETH > " + ethers.utils.formatEther(bal, {}));
                logger.debug("Typeof In ETH > " + typeof (ethers.utils.formatEther(bal, {})));
                let ethNested = JSON.parse(JSON.stringify(wallet.eth));
                ethNested.amount = ethers.utils.formatEther(bal, {});
                wallet.eth = ethNested;
                wallet.save (function (err, updatedWallet) {
                    if (err) return handleError(err);
                    return res.status(200).json(updatedWallet.eth);
                });
            }).catch(error => { console.error('caught', error); });     
        }else if('XMR' === walletType){
            console.log(wallet.monero);
            moneroWallet.openWallet(wallet.monero.name, wallet.monero.password).then(function(result) {
                moneroWallet.balance().then(availBalance=>{
                    logger.debug(availBalance);
                    let moneroNested = JSON.parse(JSON.stringify(wallet.monero));
                    wallet.monero.balance = availBalance;
                    wallet.monero = moneroNested;
                    wallet.save(function (err, updatedWallet) {
                        if (err) return handleError(err);
                        return res.status(200).json(updatedWallet.monero);
                    });
                });
            });
        }else if('XLM' === walletType){
            console.log(wallet.stellar);
            stellarWallet.balance(wallet.stellar.public_address, wallet.email);
            Wallet.findById(walletId, function(err, wallet){
                if (err) return handleError(err);
                return res.status(200).json(wallet.stellar);
            });
        }else if('ADA' === walletType){
            console.log(wallet.cardano);
            return res.status(200).json(wallet.cardano);
        }else if('XRP' === walletType){
            //console.log(wallet.ripple);
            rippleWallet.balance(wallet.ripple.account.address, wallet.email);
            return res.status(200).json(wallet.ripple);
        }else{
            res.status(500).json({error: 'unsupported crypto currency'});
        }
    })
    
});


router.get('/generate/:email/:password/:language', function(req, res, next) {
    var emailAddy = req.params.email;
    var walletGlobalPassword = req.params.password;
    var _language = req.params.language;
    
    Wallet.findOne({ 'email': emailAddy },function (err, wallet) {
        logger.debug(err);
        if (err) {
            logger.error(err);
        }
        if (wallet == null) {
            logger.debug("creating wallet ....");
            Wallet.create({ email: emailAddy, eth: {}, monero: {}, cardano: {}, ripple: {}, stellar: {} }, function (err, createdWallet) {
                //logger.debug(wallet);
                if (err) {
                    logger.error(err);
                }
                // saved!
                if(createdWallet != null){
                    adaWallet.createWallet(walletGlobalPassword, emailAddy);
                    
                    ethWallet.createWallet(walletGlobalPassword, emailAddy).then(result => {
                        //logger.debug("result" + result);
                        Wallet.findOne({ 'email': emailAddy },function (err, wallet) {
                            //logger.debug(wallet);
                            wallet.eth = result;
                            wallet.save(function (err, updatedWallet) {
                                if (err) return handleError(err);
                                //logger.debug(updatedWallet);
                            });
                        });
                    });

                    //logger.debug(Util);
                    var walletFileName = utils.makeid();
                    //logger.debug("emailAddy>>>" + emailAddy);
                    moneroAccInfo.name = walletFileName;
                    moneroAccInfo.password = walletGlobalPassword;
                    moneroAccInfo.language = _language;
                    moneroAccInfo.email = emailAddy;
                    
                    //logger.debug("moneroAccInfo>>>" + JSON.stringify(moneroAccInfo));
                    bluebird.reduce( [createWallet(moneroAccInfo), getAddress(moneroAccInfo), getViewKey(moneroAccInfo), getSpendKey(moneroAccInfo), getSeed(moneroAccInfo), updateWallet(moneroAccInfo)], function ( moneroAccInfo ) {
                        return moneroAccInfo;             
                    }, moneroAccInfo ).then( function ( result ) {
                        //logger.debug( "---> --> seq result "  + JSON.stringify(result ));
                    } );
                    
                    rippleWallet.generate(emailAddy);
                    stellarWallet.generate(emailAddy);
                }
                
                return res.status(200).json(createdWallet);
            })
        }else{
            return res.status(200).json(wallet);
        }
    });
});

function createWallet(moneroAccInfo){
    return moneroWallet.createWallet(moneroAccInfo);
}

function getAddress(moneroAccInfo){
    return moneroWallet.address();
}

function getBalance(moneroAccInfo){
    return moneroWallet.balance();
}

function getViewKey(moneroAccInfo){
    return moneroWallet.queryKey('view_key');
}

function getSpendKey(moneroAccInfo){
    return moneroWallet.queryKey('spend_key');
}

function getSeed(moneroAccInfo){
    return moneroWallet.queryKey('mnemonic');
}

function updateWallet(moneroAccInfo){
    Wallet.findOne({ 'email': moneroAccInfo.email },function (err, wallet) {
        //logger.debug(wallet);
        wallet.monero = moneroAccInfo;
        wallet.save(function (err, updatedWallet) {
            if (err) return handleError(err);
            //logger.debug(updatedWallet);
        });
    });
}

evtEmitter.on('walletEvt', function (arg) {
    logger.debug("Wallet Event !");
    logger.debug(arg);
    moneroAccInfo.accInfo.push(arg);
    logger.debug("moneroAccInfo.accInfo.length>" + moneroAccInfo.accInfo.length);
    if(moneroAccInfo.accInfo.length == 5) {
        Wallet.findOne({ 'email': moneroAccInfo.email },function (err, wallet) {
            //logger.debug(wallet);
            wallet.monero = moneroAccInfo;
            wallet.save(function (err, updatedWallet) {
                if (err) return handleError(err);
                //logger.debug(updatedWallet);
            });
        });
    }
});

function handleError(error){
    logger.error(error);
}

function web3StringToBytes32(text) {
    var result = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(text));
    while (result.length < 66) { result += '0'; }
    if (result.length !== 66) { throw new Error("invalid web3 implicit bytes32"); }
    return result;
}

module.exports = router;
