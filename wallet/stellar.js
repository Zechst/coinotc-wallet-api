'user strict'

var http = require('http');
const chalk = require('chalk');
var Wallet = require('./wallet');

const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8081');
// wallet class to be extended with prototype method.
class StellarWallet extends Wallet{
    constructor(){
        super("127.0.0.1", 8080);
    }
}

ws.on('message', function incoming(data) {
    // store to mongodb
    console.log(data);
});

StellarWallet.prototype.balance = function(walletAddress){
    console.log(walletAddress);
    let messageIn = {
        type: 'balance',
        walletAddress: walletAddress
    }
    ws.on('open', function open() {
        ws.send(JSON.stringify(messageIn));
    });
}


StellarWallet.prototype.generate = function(){
    let messageIn = {
        type: 'generateAddress'
    }
    ws.on('open', function open() {
        ws.send(JSON.stringify(messageIn));
    });   
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
    ws.on('open', function open() {
        ws.send(JSON.stringify(messageIn));
    });
}


module.exports = StellarWallet;