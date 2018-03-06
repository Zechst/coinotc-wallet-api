'use strict'
var mongoose = require('mongoose');
const config = require('../config');
const WebSocket = require('ws');
var Wallet = require('./wallet');
var WalletDB = mongoose.model('Wallet');
console.log(">>>>> " + config.cardanoWSAddress);
var cardanoAddress = "ws://a524c91b.ngrok.io";
var ws = new WebSocket(cardanoAddress);
ws.on('open', function open(){
    console.log("connection established...");
    ws.on('message', function incoming(data){
        handleIncomingData(data);
    });
});

class CardanoWallet extends Wallet{
    constructor(address, port){
        super(null , null);
    }
}

CardanoWallet.prototype.createWallet = (passphrase, emailAddress)=> {
    console.log("inside>>>"  +ws);
    var txn_message_new = {
        type: 'new',
        email: emailAddress,
        passphrase: passphrase
    };
    console.log("before inside>2>>");
    sendTxn(txn_message_new);
};

CardanoWallet.prototype.balance = (accountAddress, walletId, emailAddress)=> {
    var txn_message_bal = {
        type: 'balance',
        cardanoAddress: accountAddress,
        walletId: walletId,
        email: emailAddress
    };
    sendTxn(txn_message_bal);
};

CardanoWallet.prototype.fees = (fromAddresswithAlias, toAddress, amount, emailAddress)=> {
    var txn_message_fees = {
        type: 'fee',
        fromAddress: fromAddresswithAlias,
        toAddress: toAddress,
        amount: amount,
        email: emailAddress
    };
    sendTxn(txn_message_fees);
};


CardanoWallet.prototype.transfer = (fromAddresswithAlias, toAddress, amount, emailAddress)=> {
    var txn_message_transfer = {
        type: 'transfer',
        fromAddress: fromAddresswithAlias,
        toAddress: toAddress,
        amount: amount,
        email: emailAddress
    };
    sendTxn(txn_message_transfer);
};

CardanoWallet.prototype.allwallets = ()=> {
    var txn_message_wallets = {
        type: 'wallets'
    };
    sendTxn(txn_message_wallets);
};

CardanoWallet.prototype.allaccounts = ()=> {
    var txn_message_accounts = {
        type: 'accounts'
    };
    sendTxn(txn_message_accounts);
};



function sendTxn(obj){
    console.log(">>>>3" + obj);
    console.log(ws.readyState === WebSocket.CLOSED);
    if(ws.readyState === WebSocket.CLOSED){
        console.log("why not reconnect?");
        ws = new WebSocket(cardanoAddress);
        ws.on('open', function open(){
            console.log("reconnect possible...");
            ws.send(JSON.stringify(obj),function ack(error) {
                console.log(error);
            });

            ws.on('message', function incoming(data){
                handleIncomingData(data)
            });
        });
    }

    if(ws.readyState === WebSocket.OPEN){
        ws.send(JSON.stringify(obj),function ack(error) {
            console.log(error);
        });
    }
}

function handleIncomingData(data){
    console.log("<<<<< Back from engines >>>>> " + data);
    var returnData = JSON.parse(data);
    console.log("<<<<< Back from engines >>>>> " + returnData.email);
    WalletDB.findOne({ 'email': returnData.email },function (err, wallet) {
        console.log(wallet);
        wallet.cardano = returnData;

        wallet.save(function (err, updatedWallet) {
            if (err) return handleError(err);
            console.log(updatedWallet);
        });
    });
}

module.exports = CardanoWallet;