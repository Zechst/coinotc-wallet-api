const mongoose = require('mongoose');
const router = require('express').Router();
const logger = require('../../util/logger');
const Big = require('big.js');
var _ = require('lodash');

var Escrow = mongoose.model('Escrow');
var Wallet = mongoose.model('Wallet');
var Transactions = mongoose.model('Transactions');
var CardanoWallet = require('../../wallet/cardano');
var EthereumWallet = require('../../wallet/ethereum');
var MoneroWallet = require('../../wallet/monero');
var RippleWallet = require('../../wallet/ripple');
var StellarWallet = require('../../wallet/stellar');

var adaWallet = CardanoWallet.instance;
var ethWallet = EthereumWallet.instance;
var moneroWallet = MoneroWallet.instance;
var rippleWallet = RippleWallet.instance;
var stellarWallet = StellarWallet.instance;

router.get('/get-transaction/:type/:trxId/:email', function(req, res, next) {
    let email = req.params.email;
    let orderNo = req.params.orderNo;
    let type = req.params.type;
    console.log(`${email} - ${orderNo}`);
    Transactions.findOne({'email':email, 'orderNo': orderNo, 'type': type} ,function (err, trxn) {
        if(err) res.status(500).json(err);
        return res.status(200).json(trxn);
    });
});

router.get('/transaction-history/:email', function(req, res, next) {
    let email = req.params.email;
    console.log(`${email}`);
    Transactions.findOne({'email':email} ,function (err, result) {
        if(err) res.status(500).json(err);
        return res.status(200).json(result);
    });
});

router.post('/held', function(req, res, next) {
    console.log(req.body);
    let escrowInfo = null;
    let emailWallet = null;
    try{
        let transferBody  = JSON.parse(JSON.stringify(req.body));
        console.log(JSON.stringify(transferBody));
        if(transferBody.beneficiaryEmail === transferBody.email){
            return res.status(500).json({error: 'transfers to your own wallet address is not allowed.'});
        }
        // do not store the pin it is just for verification
        let pin = transferBody.pin;
        // use the pin to verify the front end.
        let beneficiaryEmail = transferBody.beneficiaryEmail;
        // search the beneficiaryEmail for the fromAddress
        // get platform fee from the escrow
        getEscrowInformationByType(transferBody.cryptoCurrency)
            .then(function(result){
                escrowInfo = result;
                transferBody.transactionFee = escrowInfo.feeRate;
        });

        getWalletByEmail(transferBody.email).then(function(walletFromEmail){
            getfromAddress(transferBody.email, 
                                    transferBody.cryptoCurrency, 
                                    walletFromEmail)
                .then(function(fromAddressFromWallet){
                    console.log(`fromAddressFromWallet ${fromAddressFromWallet}`);
                getBeneficiaryEmail(transferBody.type, transferBody.toAddress).then(function(receipentEmail){
                    Transactions.findOne({'orderNo': transferBody.orderNo },function (err, trxn) {
                        if(err) {
                            console.log(err);
                            res.status(500).json(err);
                        }
                        console.log(trxn);
                        if(trxn == null){
                            // status , fromAddressFromWallet , 
                            console.log("fromAddressFromWallet << >>>" + fromAddressFromWallet);
                            // status 0 means locked !
                            executeTransfertoEscrow(0, fromAddressFromWallet, transferBody, 
                                escrowInfo, res, walletFromEmail, receipentEmail, escrowInfo.address);
                        }else{
                            console.log(`Order already exist. 
                                    ${transferBody.orderNo} - from ${fromAddressFromWallet}
                                    - to ${transferBody.toAddress} - type : ${transferBody.type}`);
                            res.status(500).json({errorCode: 10001, error: `Order already exist. 
                            ${transferBody.orderNo} - from ${fromAddressFromWallet}
                            - to ${transferBody.toAddress} - type : ${transferBody.type}`});
                        }
                    });
                }).catch(function(error){ 
                    console.log(error);
                    res.status(500).json(error); }); 
            }).catch(function(error){ 
                console.log(error);
                res.status(500).json(error); });
        }).catch(function(error){ 
            console.log(error);
            res.status(500).json(error); });
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
});

router.post('/unlock-transfer/:orderNo', function(req, res, next) {
    let orderNo = req.params.orderNo;
    logger.debug(orderNo);
    Transactions.findOne({'orderNo':orderNo} ,function (err, trxn) {
        if(err) res.status(500).json(err);
        trxn.status = 1;
        trxn.save(function(err, updateTransaction){
            console.log();
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }
            return res.status(200).json(updateTransaction);
        })
    });
});

function getEscrowInformationByType(cryptoType){
    return new Promise(function(resolve, reject){
        Escrow.findOne({cryptoType: cryptoType },function (err, escrowResult) {
            console.log("escrowResult >>>> " + escrowResult);
            if(err) reject(err);
            resolve(escrowResult);
    });})
}

function getWalletByEmail(email){
    return new Promise (function(resolve, reject){
        Wallet.findOne({'email': email },function (err, wallet) {
            if(err) reject(err);
            console.log(wallet);
            resolve(wallet);
        });
    });
}

function getfromAddress(email, type, wallet){
    console.log(`--> ${email} type : ${type} , wallet ${wallet}`);
    let fromAddress = null;
    if(wallet.email === email){
        return new Promise(function(resolve, reject){
            if('eth' === type){
                if(typeof(_.get(wallet, 'eth')) === 'undefined'){
                    reject({error: 'getFromAddress for eth is null.'});
                }
                fromAddress = wallet.eth.address;
            }else if('xmr' === type){
                if(typeof(_.get(wallet, 'monero')) === 'undefined'){
                    reject({error: 'getFromAddress for xmr is null.'});
                }
                fromAddress = wallet.monero.accInfo[0].result.address;
            }else if('xlm' === type){
                if(typeof(_.get(wallet, 'stellar')) === 'undefined'){
                    reject({error: 'getFromAddress for xlm is null.'});
                }
                fromAddress = wallet.stellar.public_address;
            }else if('xrp' === type){
                if(typeof(_.get(wallet, 'ripple')) === 'undefined'){
                    reject({error: 'getFromAddress for xrp is null.'});
                }
                fromAddress = wallet.ripple.account.address;
            }else if('ada' === type){
                if(typeof(_.get(wallet, 'cardano')) === 'undefined'){
                    reject({error: 'getFromAddress for ada is null.'});
                }
                fromAddress = wallet.cardano.result.Right.cwId;
            }
            console.log(`type : ${type} from ${fromAddress}`);
            resolve(fromAddress);
        });
    }else{
        reject({error: 'Transfer Email is not the same as the stored wallet\'s email.'});
    }
}

function getBeneficiaryEmail(type, address){
    console.log(`type : ${type} , address ${address}`);
    let whereClause ="";
    if('eth' === type){
        whereClause = {'eth.address': address };
    }else if('xmr' === type){
        whereClause = {'monero.accInfo[0].address': address };
    }else if('xlm' === type){
        whereClause = {'stellar.public_address': address };
    }else if('xrp' === type){
        whereClause = {'ripple.account.address': address };
    }else if('ada' === type){
        whereClause = {'cardano.result.Right.cwId': address };
    }

    return new Promise(function(resolve, reject){
        Wallet.findOne(whereClause,function (err, wallet) {
            if(err) {
                console.log(err);
                return reject(err);
            }
            console.log("Beneficiary email -> " + wallet.email);
            resolve(wallet.email);
        });
    });
}

function updateTransaction(newTransaction, res){
    newTransaction.save(function(err, insertedTransaction){
        console.log();
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        return res.status(200).json(insertedTransaction);
    });
}

function executeTransfertoEscrow(_status, fromAddressFromWallet, 
        transferBody, escrowInfo, res, walletFromEmail, receipentEmail){
    var newTransaction = new Transactions({ 
        orderNo: transferBody.orderNo,
        email: transferBody.email,
        fromAddress: fromAddressFromWallet,
        toAddress: transferBody.toAddress,
        unit: transferBody.unit,
        equivalentAmount: transferBody.equivalentAmount,
        transactCurrency: transferBody.transactCurrency,
        cryptoCurrency: transferBody.cryptoCurrency,
        platformFee: escrowInfo.feeRate,
        escrowId: escrowInfo.id,
        beneficiaryEmail: receipentEmail,
        status: _status,
        memo: transferBody.memo
    });

    console.log("Calling wallet handlers....held by escrow");
    console.log("[ SOURCE ADDRESS ] ==> " + escrowInfo.address);
    if(transferBody.cryptoCurrency === 'eth'){
        let amountToBeTransferForEth =  new Big(transferBody.unit);
        // multiple by 1000000 before sending to the API.
        amountToBeTransferForEth.times(1000000000000000000);
        ethWallet.transfer(escrowInfo.address, amountToBeTransferForEth, 
            walletFromEmail.eth.privateKey).then(transactionHash => {
            logger.debug("ETH transfer -> " + JSON.stringify(transactionHash));
            insertedTransaction.receipt = transactionHash;
            updateTransaction(insertedTransaction,res);
        }).catch(error => { 
            console.error('caught', error); 
        });
    }else if(transferBody.cryptoCurrency === 'xmr'){
        moneroWallet.openWallet(walletFromEmail.monero.name, 
            walletFromEmail.monero.password).then((result)=> {
            let amountToBeTransferForXMR =  new Big(transferBody.unit);
            var destination = {
                address: escrowInfo.address,
                amount: amountToBeTransferForXMR
            }
            var arrDest = [];
            arrDest.push(destination);
            moneroWallet.transfer(arrDest).then(function(xferResult){
                logger.debug("transfer ....");
                logger.debug(xferResult);
                insertedTransaction.receipt = xferResult
                updateTransaction(insertedTransaction,res);
            }).catch((error)=>{
                logger.debug("xfer error "+ error);
            });
        });
        
    }else if(transferBody.cryptoCurrency === 'xlm'){
        let amountToBeTransferForXLM =  new Big(transferBody.unit);
        stellarWallet.transfer(walletFromEmail.stellar.public_address,
            walletFromEmail.stellar.wallet_secret,
            escrowInfo.address,
            amountToBeTransferForXLM,
            transferBody.memo,
            insertedTransaction
        );
        return res.status(200).json(insertedTransaction);
    }else if(transferBody.cryptoCurrency === 'xrp'){
        let amountToBeTransferForXRP =  new Big(transferBody.unit);
        rippleWallet.transfer(walletFromEmail.ripple.account.address, 
            escrowInfo.address, 
            amountToBeTransferForXRP, 
            walletFromEmail.ripple.account.secret,
            insertedTransaction);
        return res.status(200).json(insertedTransaction);
    }else if(transferBody.cryptoCurrency === 'ada'){
        let amountToBeTransferForAda =  new Big(transferBody.unit);
        // multiple by 1000000 before sending to the API.
        amountToBeTransferForAda.times(1000000);
        console.log(">> " + walletFromEmail.cardano.result.Right.cwId)
        adaWallet.transfer(
                walletFromEmail.cardano.result.Right.cwId,
                escrowInfo.address, 
                amountToBeTransferForAda,
                insertedTransaction);
        return res.status(200).json(insertedTransaction);
    }
}

module.exports = router;