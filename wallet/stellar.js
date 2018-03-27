'user strict'

var http = require('http');
const chalk = require('chalk');
var Wallet = require('./wallet');
var mongoose = require('mongoose');
const logger = require('../util/logger');
var WalletDB = mongoose.model('Wallet');

const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8081');

ws.on('open', function open() {
    //logger.debug("connected ...");
    ws.on('message', function incoming(data) {
        //logger.debug("--- Stellar ------");
        //logger.debug(data);
        var incData = JSON.parse(data);
        logger.debug(incData);
        if(incData.type === 'generateAddress'){
            WalletDB.findOne({ 'email': incData.email },function (err, wallet) {
                //logger.debug("found ! " + wallet);
                wallet.stellar = incData;
                
                wallet.save(function (err, updatedWallet) {
                    if (err) return handleError(err);
                });
            });
        }

        if(incData.type === 'balance'){
            WalletDB.findOne({ 'email': incData.email },function (err, wallet) {
                let stellarNested = JSON.parse(JSON.stringify(wallet.stellar));
                stellarNested.balance = incData.value;
                wallet.stellar = stellarNested;
                wallet.save(function (err, updatedWallet) {
                    if (err) return handleError(err);
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

StellarWallet.prototype.balance = function(walletAddress, emailAddress){
    logger.debug(walletAddress);
    let messageIn = {
        type: 'balance',
        walletAddress: walletAddress,
        email: emailAddress
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

const handleError = (message) => {
    logger.error(message);
    logger.error(chalk.red(message.name), '\n')
}

module.exports = StellarWallet;