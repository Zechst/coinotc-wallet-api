'user strict'

var http = require('http');
var Wallet = require('./wallet');
const logger = require('../util/logger');

const singleton = Symbol();
const singletonEnforcer = Symbol();

// wallet class to be extended with prototype method.
class MoneroWallet extends Wallet{
    constructor(enforcer){
        if(enforcer != singletonEnforcer) throw "Cannot construct singleton";
        let hostname = process.env.MONERO_HOSTNAME;
        let port = process.env.MONERO_PORT;
        super(hostname, port);
        this._type = 'MoneroWallet';
    }

    static get instance() {
        if(!this[singleton]) {
          this[singleton] = new MoneroWallet(singletonEnforcer);
        }
        return this[singleton];
    }
}

MoneroWallet.prototype.createWallet = function(moneroAccInfo){
    let method = 'create_wallet';
    let params = {
        filename: moneroAccInfo.name,
        password: moneroAccInfo.password,
        language: moneroAccInfo.language,
    };
    //logger.debug(params);
    return this._body(method, params);
}

MoneroWallet.prototype.openWallet = async function(walletFilename, walletPassword){
    let method = 'open_wallet';
    let params = {
        filename: walletFilename,
        password: walletPassword,
    };
    return await this._body(method, params);
}

MoneroWallet.prototype.addAddressBook = async function(walletAddress, walletDescription){
    let method = 'add_address_book';
    
    let newparams = {
        address: walletAddress.address,
        payment_id: "0000000000000000000000000000000000000000000000000000000000000000",
        description: walletDescription
    };
    //logger.debug(newparams);
    return await this._body(method, newparams);
}

MoneroWallet.prototype.getAddressBook = async function(entries){
    let method = 'get_address_book';
    
    let newparams = {
        entries: entries
    };
    //logger.debug(newparams);
    return await this._body(method, newparams);
}

// returns the wallet balance
MoneroWallet.prototype.balance = async function(_walletId) {
    let method = 'getbalance';
    let params = {
        walletId: _walletId
    };
    return await this._body(method, params);
};


MoneroWallet.prototype.rescanSpent = async function() {
    let method = 'rescan_spent';
    return await this._body(method);
};

MoneroWallet.prototype.storeWallet = async function() {
    let method = 'store';
    return await this._body(method);
};
// return the wallet address
MoneroWallet.prototype.address = async function() {
    let method = 'getaddress';
    return await this._body(method);
};

// transfer Monero to a single recipient, or a group of recipients
MoneroWallet.prototype.transfer = async function(destinations, options) {
    logger.debug("transfer ....");
    if(typeof options === 'undefined') options = {};
    if(Array.isArray(destinations)) {
        logger.debug(">>>" + destinations);
        destinations.forEach((dest) => dest.amount = convert(dest.amount));
    } else {
        logger.debug(">>>333destinations " + destinations);
        destinations.amount = convert(destinations.amount);
        destinations = [destinations];
    }
    logger.debug(typeof destinations);
    logger.debug(destinations);
    let method = 'transfer';
    let params = {
        destinations: destinations,
        get_tx_key: true,
        orderNo: destinations[0].orderNo
    };
    logger.debug("transfer2 ...." + destinations[0].orderNo);
    logger.debug(params);
    return await this._body(method, params);
};

// split a transfer into more than one tx if necessary
MoneroWallet.prototype.transferSplit = async function(destinations, options) {
    if(typeof options === 'undefined') options = {};
    if(Array.isArray(destinations)) {
        destinations.forEach((dest) => dest.amount = convert(dest.amount));
    } else {
        destinations.amount = convert(destinations.amount);
        destinations = [destinations];
    }
    let method = 'transfer_split';
    let params = {
        destinations: destinations,
        mixin: parseInt(options.mixin) || 4,
        unlock_time: parseInt(options.unlockTime) || 0,
        payment_id: options.pid || null
    };
    return await this._body(method, params);
};

// send all dust outputs back to the wallet with 0 mixin
MoneroWallet.prototype.sweep = async function() {
    let method = 'sweep_dust';
    return await this._body(method);
};

// get a list of incoming payments using a given payment ID
MoneroWallet.prototype.getPayments = async function(pid) {
    let method = 'get_payments';
    let params = {};
    params.payment_id = pid;
    return await this._body(method, params);
};

// get a list of incoming payments using a single payment ID or list of payment IDs from a given height
MoneroWallet.prototype.getBulkPayments = async function(pids, minHeight) {
    let method = 'get_bulk_payments';
    let params = {};
    params.payment_ids = pids;
    params.min_block_height = minHeight;
    return await this._body(method, params);
};

// return a list of incoming transfers to the wallet (type can be "all", "available", or "unavailable")
MoneroWallet.prototype.incomingTransfers = async function(type) {
    let method = 'incoming_transfers';
    let params = {};
    params.transfer_type = type;
    return await this._body(method, params);
};

// return the spend key or view private key (type can be 'mnemonic' seed or 'view_key')
MoneroWallet.prototype.queryKey = async function(type) {
    let method = 'query_key';
    let params = {};
    params.key_type = type;
    return await this._body(method, params);
};

// make an integrated address from the wallet address and a payment id
MoneroWallet.prototype.integratedAddress = async function(pid) {
    let method = 'make_integrated_address';
    let params = {};
    params.payment_id = pid;
    return await this._body(method, params);
};

// retrieve the standard address and payment id from an integrated address
MoneroWallet.prototype.splitIntegrated = async function(address) {
    let method = 'split_integrated_address';
    let params = {};
    params.integrated_address = address;
    return await this._body(method, params);
};

// return the current block height
MoneroWallet.prototype.height = async function() {
    let method = 'getheight';
    return await this._body(method);
};

// stop the current simplewallet process
MoneroWallet.prototype.stopWallet = async function() {
    let method = 'stop_wallet';
    return await this._body(method);
};

module.exports = MoneroWallet;


function convert(amount) {
    let number = Number(amount) * 1e12;
    // remove any decimals
    number = number.toFixed(0);
    return Number(number);
}
