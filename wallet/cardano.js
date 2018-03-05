'use strict'

const config = require('../config');
const WebSocket = require('ws');
var Wallet = require('./wallet');
console.log(">>>>> " + config.cardanoWSAddress);
const ws = new WebSocket('ws://9ff12ae5.ngrok.io');
console.log(ws);
// wallet class to be extended with prototype method.
class CardanoWallet extends Wallet{
    constructor(address, port){
        super(null , null);
    }
}

CardanoWallet.prototype.createWallet = (passphrase)=> {
    var txn_message_new = {
        type: 'new',
        passphrase: passphrase
    };
    ws.on('open', open =>{
        sendTxn(txn_message_new);
    });
};

CardanoWallet.prototype.balance = (accountAddress, walletId)=> {
    var txn_message_bal = {
        type: 'balance',
        cardanoAddress: accountAddress,
        walletId: walletId
    };
    ws.on('open', open =>{
        sendTxn(txn_message_bal);
    });
};

CardanoWallet.prototype.fees = (fromAddresswithAlias, toAddress, amount)=> {
    var txn_message_fees = {
        type: 'fee',
        fromAddress: fromAddresswithAlias,
        toAddress: toAddress,
        amount: amount
    };
    ws.on('open', open =>{
        sendTxn(txn_message_fees);
    });
};


CardanoWallet.prototype.transfer = (fromAddresswithAlias, toAddress, amount)=> {
    var txn_message_transfer = {
        type: 'transfer',
        fromAddress: fromAddresswithAlias,
        toAddress: toAddress,
        amount: amount
    };
    ws.on('open', open =>{
        sendTxn(txn_message_transfer);
    });
};

CardanoWallet.prototype.allwallets = ()=> {
    var txn_message_wallets = {
        type: 'wallets'
    };
    ws.on('open', open =>{
        sendTxn(txn_message_wallets);
    });
};

CardanoWallet.prototype.allaccounts = ()=> {
    var txn_message_accounts = {
        type: 'accounts'
    };
    ws.on('open', open =>{
        sendTxn(txn_message_accounts);
    });
};

ws.on('message', function incoming(data){
    console.log(data);
});

function sendTxn(obj){
    ws.send(JSON.stringify(pbj));
}

module.exports = CardanoWallet;