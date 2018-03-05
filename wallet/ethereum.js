'use strict'
// Using the Ethers umbrella package...
var ethers = require('ethers');
var providers = require('ethers').providers;
var bip39 = require('bip39');
var Wallet = require('./wallet');
var config = require('../config');
var network = providers.networks.rinkeby;
console.log(">>>>>>" + config.ether_geth_rpc);
var provider = new providers.JsonRpcProvider('http://localhost:8545', network);

class EthereumWallet extends Wallet{
    
    constructor(gethAddress){
        var ethAddress = config.ether_geth_hostname;
        var ethAddressPort = config.ether_geth_port;
        console.log(ethAddress);
        console.log(ethAddressPort);
        super(ethAddress, parseInt(ethAddressPort));
    }
}

function callback(percent) {
    console.log("Encrypting: " + parseInt(percent * 100) + "% complete");
}

EthereumWallet.prototype.createWallet = (passphrase)=> {
    console.log("....");
    var mnemonic = bip39.generateMnemonic();
    var wallet = ethers.Wallet.fromMnemonic(mnemonic);
    wallet.provider = provider;
    
    console.log("Address: " + wallet.address);
    let generatedEthAcc = {
        privateKey: wallet.privateKey,
        mnemonic: mnemonic,
        address: wallet.address
    }
    console.log(generatedEthAcc);
    let requestPromise = new Promise((resolve, reject) => {
        if(!(typeof(wallet.address) === 'undefined')){
            var encryptPromise = wallet.encrypt(passphrase, callback);
            
            encryptPromise.then(function(json) {
                console.log(json);
                resolve(generatedEthAcc);
            });
        }
    }).catch(error => { console.log('caught', err.message); });
    return requestPromise;
}

EthereumWallet.prototype.balance = (privateKey)=> {
    console.log("...check balance" + privateKey);
    var wallet = new ethers.Wallet(privateKey);
    wallet.provider = provider;
    
    console.log("...wallet >" + JSON.stringify(wallet));
    console.log("...check provider" + JSON.stringify(wallet.provider));
    console.log("...check address" + JSON.stringify(wallet.getAddress()));

    return wallet.getBalance('latest');
}

EthereumWallet.prototype.transfer = (destAct, value, privateKey)=> {
    var wallet = new ethers.Wallet(privateKey);
    wallet.provider = provider;

    // These will query the network for appropriate values
    var options = {
        //gasLimit: 21000
        //gasPrice: utils.bigNumberify("20000000000")
    };

    var promiseSend = wallet.send(destAct, value, options);
    return promiseSend;    
}

EthereumWallet.prototype.estimateTransaction = (destAct, value, privateKey)=> {
    var wallet = new ethers.Wallet(privateKey);
    wallet.provider = provider;

    var transaction = {
        // Recommendation: omit nonce; the provider will query the network
        // nonce: 0,
    
        // Gas Limit; 21000 will send ether to another use, but to execute contracts
        // larger limits are required. The provider.estimateGas can be used for this.
        gasLimit: 1000000,
    
        // Recommendations: omit gasPrice; the provider will query the network
        //gasPrice: utils.bigNumberify("20000000000"),
    
        // Required; unless deploying a contract (in which case omit)
        to: destAct,
    
        // Optional
        data: "0x",
    
        // Optional
        value: ethers.utils.parseEther(value),
    
        // Recommendation: omit chainId; the provider will populate this
        // chaindId: providers.Provider.chainId.homestead
    };
    
    //Estimate the gas cost for the transaction
    var estimateGasPromise = wallet.estimateGas(transaction);
    
    return estimateGasPromise;
}


module.exports = EthereumWallet;

