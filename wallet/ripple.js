'use strict'
const chalk = require('chalk')
const RippleAPI = require('ripple-lib').RippleAPI
var Wallet = require('./wallet');
var mongoose = require('mongoose');
var WalletDB = mongoose.model('Wallet');

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
        console.log(data);
        console.log("--- Ripple ------" + incData.email);
        console.log(incData);
        if(incData.type === 'generateAddress'){
            WalletDB.findOne({ 'email': incData.email },function (err, wallet) {
                console.log("found ! " + wallet);
                wallet.ripple = incData;
    
                wallet.save(function (err, updatedWallet) {
                    if (err) return handleError(err);
                    console.log(updatedWallet);
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

const fail = (message) => {
    console.log(message);
    console.log(chalk.red(message.name), '\n')
}

module.exports = RippleWallet;