'use strict'
const chalk = require('chalk')
const RippleAPI = require('ripple-lib').RippleAPI
var Wallet = require('./wallet');
var mongoose = require('mongoose');
var WalletDB = mongoose.model('Wallet');
const logger = require('../util/logger');

const api = new RippleAPI({
    server: process.env.RIPPLE_API
})

// wallet class to be extended with prototype method.
class RippleWallet extends Wallet{
    constructor(){
        super(null, null);
    }
}

const WebSocket = require('ws');

const ws = new WebSocket(process.env.RIPPLE_WS_CLIENT);

ws.on('open', function open() {
    ws.on('message', function incoming(data) {
        var incData = JSON.parse(data);
        //logger.debug(data);
        //logger.debug("--- Ripple ------" + incData.email);
        //logger.debug("incoming data from websocket > " + JSON.stringify(incData));
        
        if(incData.type === 'generateAddress'){
            WalletDB.findOne({ 'email': incData.email },function (err, wallet) {
                //logger.debug("found ! " + wallet);
                wallet.ripple = incData;
                wallet.ripple.amount = 0;
                wallet.save(function (err, updatedWallet) {
                    if (err) return handleError(err);
                    //logger.debug(updatedWallet);
                });
            });
        }else if(incData.type === 'balance'){
            //console.log('get balance for ripple ...');
            WalletDB.findOne({ 'email': incData.email },function (err, wallet) {
                //console.log(incData);
                //wallet.ripple = incData;
                let rippleNested = JSON.parse(JSON.stringify(wallet.ripple));
                rippleNested.amount = incData.value;
                wallet.ripple = rippleNested;
                wallet.save(function (err, updatedWallet) {
                    if (err) return handleError(err);
                    //logger.debug(updatedWallet);
                });
            });
        } 
    });    
});

RippleWallet.prototype.balance = function(walletAddress, emailAddress){
    let messageIn = {
        type: 'balance',
        walletAddress: walletAddress,
        email: emailAddress
    }
    ws.send(JSON.stringify(messageIn));
    
}

RippleWallet.prototype.generate = function(emailAddress){
    let messageIn = {
        type: 'generateAddress',
        email: emailAddress
    }
    ws.send(JSON.stringify(messageIn));
}

RippleWallet.prototype.transfer= function(sourceAddress, 
    destinationAddress, amount, sourceSecret, destinationTag, emailAddress){
    let messageIn = {
        type: 'transfer',
        transfer: {
            sourceAddress: sourceAddress,
            destinationAddress: destinationAddress,
            amount:  amount,
            destinationTag: destinationTag,
            sourceSecret: sourceSecret
        },
        email: emailAddress
    }
    ws.send(JSON.stringify(messageIn));
}

const handleError = (message) => {
    logger.error(message);
    logger.error(chalk.red(message.name), '\n')
}

module.exports = RippleWallet;