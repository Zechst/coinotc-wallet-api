'use strict'
const chalk = require('chalk')
const RippleAPI = require('ripple-lib').RippleAPI
var config = require('../config');
var Wallet = require('./wallet');


const api = new RippleAPI({
    server: 'wss://s1.ripple.com'
})

// wallet class to be extended with prototype method.
class RippleWallet extends Wallet{
    constructor(){
        super(null, null);
    }
}

const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('message', function incoming(data) {
    // store to mongodb
    console.log(data);
});

RippleWallet.prototype.balance = function(walletAddress){
    let messageIn = {
        type: 'balance',
        walletAddress: walletAddress
    }
    ws.on('open', function open() {
        ws.send(JSON.stringify(messageIn));
    });
}

RippleWallet.prototype.generate = function(emailAddress){
    let messageIn = {
        type: 'generateAddress'
    }
    ws.on('open', function open() {
        ws.send(JSON.stringify(messageIn));
    });   
}

RippleWallet.prototype.transfer= function(sourceAddress, 
    destinationAddress, amount, sourceSecret, destinationTag){
    let messageIn = {
        type: 'transfer',
        transfer: {
            sourceAddress: sourceAddress,
            destinationAddress: destinationAddress,
            amount:  amount,
            destinationTag: destinationTag,
            sourceSecret: sourceSecret
        }
    }
    ws.on('open', function open() {
        ws.send(JSON.stringify(messageIn));
    });    
}

const fail = (message) => {
    console.log(message);
    console.log(chalk.red(message.name), '\n')
}

module.exports = RippleWallet;