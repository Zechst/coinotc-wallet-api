'use strict'

const config = require('../config');
const WebSocket = require('ws');

const ws = new WebSocket('ws://' + config.cardanoWSAddress  + ':' + config.cardanoWSPort);
// wallet class to be extended with prototype method.
class CardanoWallet extends Wallet{
    constructor(){
        super(config.cardanoWSAddress , config.cardanoWSPort);
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