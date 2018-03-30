const mongoose = require('mongoose');
const router = require('express').Router();
const logger = require('../../util/logger');
const Big = require('big.js');

var Escrow = mongoose.model('Escrow');
var Wallet = mongoose.model('Wallet');
var Transactions = mongoose.model('Transactions');

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
    let transferBody  = JSON.parse(JSON.stringify(req.body));
    console.log(JSON.stringify(transferBody));
    // do not store the pin it is just for verification
    let pin = transferBody.pin;
    console.log("PIN verification: " + pin);
    // use the pin to verify the front end.
    let beneficiaryEmail = transferBody.beneficiaryEmail;
    // search the beneficiaryEmail for the fromAddress
    // get platform fee from the escrow
    let escrowInfo =  getEscrowInformationByType(transferBody.cryptoCurrency);
    transferBody.transactionFee = escrowInfo.feeRate;
    let emailWallet = getWalletByEmail(transferBody.email);
    let fromAddressFromWallet = getfromAddress(transferBody.email, transferBody.type,  emailWallet);
    let receipentEmail = getBeneficiaryEmail(transferBody.type, transferBody.toAddress);
    logger.debug(beneficiaryEmail);
    Transactions.findOne({'orderNo': transferBody.orderNo },function (err, trxn) {
        if(err) {
            console.log(err);
            res.status(500).json(err);
        }
        console.log(trxn);
        if(trxn){
            // status 0 means locked !
            var newTransaction = new Transactions({ 
                orderNo: transferBody.orderNo,
                email: transferBody.email,
                fromAddress: fromAddressFromWallet,
                toAddress: transferBody.toAddress,
                unit: transferBody.unit,
                equivalentAmount: transferBody.equivalentAmount,
                transactCurrency: transferBody.transactCurrency,
                platformFee: transferBody.transactionFee,
                escrowId: escrowInfo.id,
                beneficiaryEmail: receipentEmail,
                status: 0,
                memo: transferBody.memo
            });
            newTransaction.save(function(err, insertedTransaction){
                console.log();
                if (err) {
                    console.log(err);
                    return res.status(500).json(err);
                }
                if(!insertedTransaction){

                }
                return res.status(200).json(insertedTransaction);
            })
        }else{
            if(err) {
                console.log(`Order already exist. 
                        ${transferBody.orderNo} - from ${fromAddressFromWallet}
                        - to ${transferBody.toAddress} - type : ${transferBody.type}`);
                res.status(500).json(err);
            }
        }
    });
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
    Escrow.findOne({'cryptoType': cryptoType },function (err, escrowResult) {
        return escrowResult;
    });
}

function getWalletByEmail(email){
    Wallet.findOne({'email': email },function (err, wallet) {
        return wallet;
    });
}

function getfromAddress(email, type, wallet){
    console.log(`type : ${type} , wallet ${wallet}`);
    let fromAddress = null;
    if(wallet.email === email){
        if('eth' === type){
            fromAddress = wallet.eth.address;
        }else if('xmr' === type){
            fromAddress = monero.accInfo[0].address;
        }else if('xlm' === type){
            fromAddress = wallet.stellar.public_address;
        }else if('xrp' === type){
            fromAddress = wallet.ripple.account.address;
        }else if('ada' === type){
            fromAddress = wallet.cardano.result.Right.cwId;
        }
        console.log(`type : ${type} from ${fromAddress}`);
        return fromAddress;
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

    Wallet.findOne(whereClause,function (err, wallet) {
        if(err) {
            console.log(err);
            return res.status(500).json(err);
        }
        console.log("Beneficiary email -> " + wallet.email);
        return wallet.email;
    });
}

module.exports = router;