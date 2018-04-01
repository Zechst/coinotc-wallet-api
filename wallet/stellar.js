'user strict'

var http = require('http');
const chalk = require('chalk');
var Wallet = require('./wallet');
var mongoose = require('mongoose');
const logger = require('../util/logger');
var WalletDB = mongoose.model('Wallet');
var Transactions = mongoose.model('Transactions');

const WebSocket = require('ws');

const ws = new WebSocket(process.env.STELLAR_WS_ADDRESS);
//const ws = new WebSocket('ws://localhost:8081');

ws.on('open', function open() {
    ws.on('message', function incoming(data) {
        var incData = JSON.parse(data);
        logger.debug(incData);
        if(incData.type === 'generateAddress'){
            WalletDB.findOne({ 'email': incData.email },function (err, wallet) {
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
                stellarNested.totalLockedAmount = 0;
                wallet.stellar = stellarNested;
                wallet.save(function (err, updatedWallet) {
                    if (err) return handleError(err);
                });
            });
        }

        if(incData.type === 'transfer'){
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

const singleton = Symbol();
const singletonEnforcer = Symbol();

// wallet class to be extended with prototype method.
class StellarWallet extends Wallet{
    constructor(enforcer){
        if(enforcer != singletonEnforcer) throw "Cannot construct singleton";
        // read from process.env instead of hardcoded here.
        super("127.0.0.1", 8081);
        this._type = 'StellarWallet';
    }

    static get instance() {
        if(!this[singleton]) {
          this[singleton] = new StellarWallet(singletonEnforcer);
        }
        return this[singleton];
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
    memo,
    insertedTransaction
){
    let messageIn = {
        type: 'transfer',
        transfer: {
            sourceAddress: sourceAddress,
            destinationAddress: destinationAddress,
            amount:  amount,
            memo: memo,
            sourceSecret: sourceSecret,
            insertedTransaction: insertedTransaction
        }
    }
    ws.send(JSON.stringify(messageIn));
}

const handleError = (message) => {
    logger.error(message);
    logger.error(chalk.red(message.name), '\n')
}

module.exports = StellarWallet;