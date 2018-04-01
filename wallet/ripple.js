'use strict'
const chalk = require('chalk')
const RippleAPI = require('ripple-lib').RippleAPI
var Wallet = require('./wallet');
var mongoose = require('mongoose');
var WalletDB = mongoose.model('Wallet');
const logger = require('../util/logger');
var Transactions = mongoose.model('Transactions');

const api = new RippleAPI({
    server: process.env.RIPPLE_API
})

const singleton = Symbol();
const singletonEnforcer = Symbol();

// wallet class to be extended with prototype method.
class RippleWallet extends Wallet{
    
    constructor(enforcer){
        if(enforcer != singletonEnforcer) throw "Cannot construct singleton";
        super(null, null);
        this._type = 'RippleWallet';
    }

    static get instance() {
        if(!this[singleton]) {
          this[singleton] = new RippleWallet(singletonEnforcer);
        }
        return this[singleton];
    }
}

const WebSocket = require('ws');

const ws = new WebSocket(process.env.RIPPLE_WS_CLIENT);

ws.on('open', function open() {
    ws.on('message', function incoming(data) {
        var incData = JSON.parse(data);
        
        if(incData.type === 'generateAddress'){
            WalletDB.findOne({ 'email': incData.email },function (err, wallet) {
                wallet.ripple = incData;
                wallet.ripple.amount = 0;
                wallet.save(function (err, updatedWallet) {
                    if (err) return handleError(err);
                });
            });
        }else if(incData.type === 'balance'){
            WalletDB.findOne({ 'email': incData.email },function (err, wallet) {
                let rippleNested = JSON.parse(JSON.stringify(wallet.ripple));
                rippleNested.amount = incData.value;
                rippleNested.totalLockedAmount = 0;
                wallet.ripple = rippleNested;
                wallet.save(function (err, updatedWallet) {
                    if (err) return handleError(err);
                });
            });
        } else if(incData.type === 'transfer'){
            let wsInsertedTrxn = JSON.parse(JSON.stringify(incData.insertedTransaction));
            var newTransaction = new Transactions({ 
                orderNo: wsInsertedTrxn.orderNo,
                email: wsInsertedTrxn.email,
                fromAddress: wsInsertedTrxn.fromAddress,
                toAddress: wsInsertedTrxn.toAddress,
                unit: wsInsertedTrxn.unit,
                equivalentAmount: wsInsertedTrxn.equivalentAmount,
                transactCurrency: wsInsertedTrxn.transactCurrency,
                cryptoCurrency: wsInsertedTrxn.cryptoCurrency,
                platformFee: wsInsertedTrxn.platformFee,
                escrowId: wsInsertedTrxn.escrowId,
                beneficiaryEmail: wsInsertedTrxn.beneficiaryEmail,
                status: wsInsertedTrxn.status,
                memo: wsInsertedTrxn.memo
            });
            newTransaction.save(function(err, insertedTransaction){
                console.log();
                if (err) {
                    console.log(err);
                    return res.status(500).json(err);
                }
                return res.status(200).json(insertedTransaction);
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
    destinationAddress, amount, sourceSecret, destinationTag, emailAddress, insertedTransaction){
    let messageIn = {
        type: 'transfer',
        transfer: {
            sourceAddress: sourceAddress,
            destinationAddress: destinationAddress,
            amount:  amount,
            destinationTag: destinationTag,
            sourceSecret: sourceSecret,
            insertedTransaction: insertedTransaction
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