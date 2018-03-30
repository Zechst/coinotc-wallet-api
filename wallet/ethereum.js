'use strict'
// Using the Ethers umbrella package...
var ethers = require('ethers');
var providers = require('ethers').providers;
var bip39 = require('bip39');
var Wallet = require('./wallet');
const logger = require('../util/logger');
var network = providers.networks.rinkeby;
var provider = new providers.JsonRpcProvider(process.env.ETH_RPC, network);

const singleton = Symbol();
const singletonEnforcer = Symbol();

class EthereumWallet extends Wallet{
    
    constructor(enforcer){
        if(enforcer != singletonEnforcer) throw "Cannot construct singleton";
        var ethAddress = process.env.GETH_ADDRESS;
        var ethAddressPort = process.env.GETH_PORT;
        super(ethAddress, parseInt(ethAddressPort));
        this._type = 'EthereumWallet';
    }

    static get instance() {
        if(!this[singleton]) {
          this[singleton] = new EthereumWallet(singletonEnforcer);
        }
        return this[singleton];
    }
}

function callback(percent) {
    if(percent == 0.1 || percent == 0.5 || percent == 1 ){
        logger.info("Encrypting: " + parseInt(percent * 100) + "% complete");
    }
}

EthereumWallet.prototype.createWallet = (passphrase, emailAddress)=> {
    //logger.debug("....");
    var mnemonic = bip39.generateMnemonic();
    var wallet = ethers.Wallet.fromMnemonic(mnemonic);
    wallet.provider = provider;
    
    //logger.debug("Address: " + wallet.address);
    let generatedEthAcc = {
        privateKey: wallet.privateKey,
        mnemonic: mnemonic,
        address: wallet.address
    }
    //logger.debug(generatedEthAcc);
    let requestPromise = new Promise((resolve, reject) => {
        if(!(typeof(wallet.address) === 'undefined')){
            var encryptPromise = wallet.encrypt(passphrase, callback);
            
            encryptPromise.then(function(json) {
                //logger.debug(json);
                resolve(generatedEthAcc);
            });
        }
    }).catch(error => { logger.error('caught', err.message); });
    return requestPromise;
}

EthereumWallet.prototype.balance = (privateKey)=> {
    //logger.debug("...check balance" + privateKey);
    var wallet = new ethers.Wallet(privateKey);
    wallet.provider = provider;
    
    //logger.debug("...wallet >" + JSON.stringify(wallet));
    //logger.debug("...check provider" + JSON.stringify(wallet.provider));
    //logger.debug("...check address" + JSON.stringify(wallet.getAddress()));

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

