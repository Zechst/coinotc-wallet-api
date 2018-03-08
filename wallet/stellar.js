'user strict'

var http = require('http');
const chalk = require('chalk');
var Wallet = require('./wallet');
var mongoose = require('mongoose');
var WalletDB = mongoose.model('Wallet');

const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8081');

ws.on('open', function open() {
    console.log("connected ...");
    ws.on('message', function incoming(data) {
        console.log("--- Stellar ------");
        console.log(data);
        var incData = JSON.parse(data);
        console.log(incData);
        if(incData.type === 'generateAddress'){
            WalletDB.findOne({ 'email': incData.email },function (err, wallet) {
                console.log("found ! " + wallet);
                wallet.stellar = incData;
    
                wallet.save(function (err, updatedWallet) {
                    if (err) return handleError(err);
                    console.log(updatedWallet);
                });
            });
        }
    });
});

// wallet class to be extended with prototype method.
class StellarWallet extends Wallet{
    constructor(){
        super("127.0.0.1", 8081);
    }
}

StellarWallet.prototype.balance = function(walletAddress){
    console.log(walletAddress);
    let messageIn = {
        type: 'balance',
        walletAddress: walletAddress
    }
    ws.send(JSON.stringify(messageIn));
}


StellarWallet.prototype.generate = function(emailAddress){
    let messageIn = {
        type: 'generateAddress',
        email: emailAddress
    }
    ws.send(JSON.stringify(messageIn));
}

StellarWallet.prototype.transfer = function(sourceAddress, sourceSecret,
    destinationAddress, 
    amount,
    memo
){
    let messageIn = {
        type: 'transfer',
        transfer: {
            sourceAddress: sourceAddress,
            destinationAddress: destinationAddress,
            amount:  amount,
            memo: memo,
            sourceSecret: sourceSecret
        }
    }
    ws.send(JSON.stringify(messageIn));
}


module.exports = StellarWallet;