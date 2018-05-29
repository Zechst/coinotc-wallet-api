'use strict'
const chalk = require('chalk')
var Wallet = require('./wallet');
var mongoose = require('mongoose');
var WalletDB = mongoose.model('Wallet');
const logger = require('../util/logger');
var Transactions = mongoose.model('Transactions');
const WebSocket = require('ws');

const ws = new WebSocket(process.env.RIPPLE_WS_CLIENT);

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

ws.on('open', function open() {
    ws.on('message', function incoming(data) {
        var incData = JSON.parse(data);
        console.log(incData.type);
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
                console.log(incData.value);
                rippleNested.amount = incData.value;
                rippleNested.totalLockedAmount = incData.value;
                wallet.ripple = rippleNested;
                wallet.save(function (err, updatedWallet) {
                    if (err) return handleError(err);
                });
            });
        } else if(incData.type === 'transfer'){
            console.log("Insert to transaction collection....");
            let wsInsertedTrxn = JSON.parse(JSON.stringify(incData));
            console.log("FINAL ACTION > " + wsInsertedTrxn.transfer.destinationTag.finalAction);
            console.log(" TRANSACTION.receipt > "+ wsInsertedTrxn.receipt);
            if(wsInsertedTrxn.transfer.destinationTag.finalAction == 1){
                console.log("ESCROW TO FINAL ACCOUNT !");
                Transactions.findOne({'orderNo':wsInsertedTrxn.transfer.destinationTag.orderNo} ,function (err, foundTrxn) {
                    if(err) res.status(500).json(err);
                    foundTrxn.finalReceipt = wsInsertedTrxn.receipt;
                    foundTrxn.save(function(err, updatedTransaction){
                        console.log();
                        if (err) {
                            console.log(err);
                        }
                        console.log(updatedTransaction);
                    }); 
                });
            }else{
                var newTransaction = new Transactions({ 
                    orderNo: wsInsertedTrxn.transfer.destinationTag.orderNo,
                    email: wsInsertedTrxn.transfer.destinationTag.email,
                    fromAddress: wsInsertedTrxn.transfer.destinationTag.fromAddress,
                    toAddress: wsInsertedTrxn.transfer.destinationTag.toAddress,
                    unit: wsInsertedTrxn.transfer.destinationTag.unit,
                    equivalentAmount: wsInsertedTrxn.transfer.destinationTag.equivalentAmount,
                    transactCurrency: wsInsertedTrxn.transfer.destinationTag.transactCurrency,
                    cryptoCurrency: wsInsertedTrxn.transfer.destinationTag.cryptoCurrency,
                    platformFee: wsInsertedTrxn.transfer.destinationTag.platformFee,
                    escrowId: wsInsertedTrxn.transfer.destinationTag.escrowId,
                    beneficiaryEmail: wsInsertedTrxn.transfer.destinationTag.beneficiaryEmail,
                    status: wsInsertedTrxn.transfer.destinationTag.status,
                    memo: wsInsertedTrxn.transfer.destinationTag.memo,
                    receipt: wsInsertedTrxn.receipt
                });
                newTransaction.save(function(err, insertedTransaction){
                    if (err) {
                        console.log(err);
                        throw new Error(err);
                    }
                    console.log(insertedTransaction);
                });
            }
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