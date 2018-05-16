'use strict'
var mongoose = require('mongoose');
const WebSocket = require('ws');
const chalk = require('chalk');
var Wallet = require('./wallet');
var WalletDB = mongoose.model('Wallet');
const logger = require('../util/logger');
var Transactions = mongoose.model('Transactions');

var cardanoAddress = String(process.env.CARDANO_WS_ADDRESS);
var ws = new WebSocket(cardanoAddress);
ws.on('open', function open(){
    logger.debug("ADA WS Client ... connection established...");
    ws.on('message', function incoming(data){
        handleIncomingData(data);
    });
});


const singleton = Symbol();
const singletonEnforcer = Symbol();


class CardanoWallet extends Wallet{
    constructor(enforcer){
        if(enforcer != singletonEnforcer) throw "Cannot construct singleton";
        super(null , null);
        this._type = 'CardanoWallet';
    }
    
    static get instance() {
        if(!this[singleton]) {
          this[singleton] = new CardanoWallet(singletonEnforcer);
        }
        return this[singleton];
    }
}

CardanoWallet.prototype.createWallet = (passphrase, emailAddress)=> {
    //logger.debug("inside>>>"  +ws);
    var txn_message_new = {
        type: 'new',
        email: emailAddress,
        passphrase: passphrase
    };
    //logger.debug("before inside>2>>");
    sendTxn(txn_message_new);
};

// get balance
CardanoWallet.prototype.balance = (walletId, emailAddress)=> {
    var txn_message_bal = {
        type: 'balance',
        walletId: walletId,
        email: emailAddress
    };
    sendTxn(txn_message_bal);
};

// get wallet info
CardanoWallet.prototype.wallet_info = (walletId)=> {
    var txn_message_bal = {
        type: 'wallet_info',
        walletId: walletId
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


CardanoWallet.prototype.transfer = (fromWalletId, fromAccountIndex,
        toAddress, 
        amount, 
        emailAddress, insertedTransaction)=> {
    var txn_message_transfer = {
        type: 'transfer',
        fromWalletId: fromWalletId,
        fromAccountIndex: fromAccountIndex,
        toAddress: toAddress,
        amount: amount,
        email: emailAddress,
        insertedTransaction: insertedTransaction
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
    if(ws.readyState === WebSocket.CLOSED){
        ws = new WebSocket(cardanoAddress);
        ws.on('open', function open(){
            ws.send(JSON.stringify(obj),function ack(error) {
                logger.debug(error);
            });

            ws.on('message', function incoming(data){
                handleIncomingData(data)
            });
        });
    }

    if(ws.readyState === WebSocket.OPEN){
        ws.send(JSON.stringify(obj),function ack(error) {
            logger.debug(error);
        });
    }
}

function handleIncomingData(data){
    //logger.debug("<<<<< Back from engines >>>>> " + data);
    var returnData = JSON.parse(data);
    logger.debug("<<<<< Back from engines email >>>>> " + returnData.email);
    logger.debug("<<<<< Back from engines type >>>>> " + returnData.txnMessage.type);
    
    if(returnData.txnMessage.type === 'new'){
        WalletDB.findOne({ 'email': returnData.txnMessage.email },function (err, wallet) {
            wallet.cardano = returnData;
            wallet.cardano.totalLockedAmount = 0;
            wallet.save(function (err, updatedWallet) {
                if (err) return handleError(err);
                console.log(updatedWallet);
            });
        });
    }else if(returnData.txnMessage.type === 'balance'){
        console.log('Inside balance ... of the handling of the incoming data');
        WalletDB.findOne({'email': returnData.txnMessage.email}, function(err, wallet){
            console.log("found waller for the balance ...");
            console.log(JSON.stringify(returnData));
            console.log(returnData.Right.cwAmount.getCCoin);
            let cardanoNested = JSON.parse(JSON.stringify(wallet.cardano));
            cardanoNested.amount = returnData.Right.cwAmount.getCCoin;
            wallet.cardano = cardanoNested;
            wallet.save(function (err, updatedWallet) {
                if (err) return handleError(err);
            });
        })
    }else if(returnData.txnMessage.type === 'transfer'){
        let wsInsertedTrxn = JSON.parse(JSON.stringify(returnData.insertedTransaction));
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
}

const handleError = (message) => {
    logger.error(message);
    logger.error(chalk.red(message.name), '\n')
}



module.exports = CardanoWallet;