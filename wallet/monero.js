'user strict'

var http = require('http');
var Wallet = require('./wallet');

// wallet class to be extended with prototype method.
class MoneroWallet extends Wallet{
    constructor(hostname, port){
        super(hostname, port);
    }
}

MoneroWallet.prototype.createWallet = function(walletFilename, walletPassword, walletLang){
    let method = 'create_wallet';
    let params = {
        filename: walletFilename,
        password: walletPassword,
        language: walletLang
    };
    console.log(params);
    return this._body(method, params);
}

MoneroWallet.prototype.openWallet = function(walletFilename, walletPassword){
    let method = 'open_wallet';
    let params = {
        filename: walletFilename,
        password: walletPassword,
    };
    return this._body(method, params);
}

MoneroWallet.prototype.addAddressBook = function(walletAddress, walletDescription){
    let method = 'add_address_book';
    
    let newparams = {
        address: walletAddress.address,
        payment_id: "0000000000000000000000000000000000000000000000000000000000000000",
        description: walletDescription
    };
    console.log(newparams);
    return this._body(method, newparams);
}

MoneroWallet.prototype.getAddressBook = function(entries){
    let method = 'get_address_book';
    
    let newparams = {
        entries: entries
    };
    console.log(newparams);
    return this._body(method, newparams);
}

// returns the wallet balance
MoneroWallet.prototype.balance = function() {
    let method = 'getbalance';
    return this._body(method);
};

// return the wallet address
MoneroWallet.prototype.address = function() {
    let method = 'getaddress';
    return this._body(method);
};

// transfer Monero to a single recipient, or a group of recipients
MoneroWallet.prototype.transfer = function(destinations, options) {
    if(typeof options === 'undefined') options = {};
    if(Array.isArray(destinations)) {
        destinations.forEach((dest) => dest.amount = convert(dest.amount));
    } else {
        destinations.amount = convert(destinations.amount);
        destinations = [destinations];
    }
    let method = 'transfer';
    let params = {
        destinations: destinations,
        mixin: parseInt(options.mixin) || 4,
        unlock_time: parseInt(options.unlockTime) || 0,
        payment_id: options.pid || null
    };
    return this._body(method, params);
};

// split a transfer into more than one tx if necessary
MoneroWallet.prototype.transferSplit = function(destinations, options) {
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
    return this._body(method, params);
};

// send all dust outputs back to the wallet with 0 mixin
MoneroWallet.prototype.sweep = function() {
    let method = 'sweep_dust';
    return this._body(method);
};

// get a list of incoming payments using a given payment ID
MoneroWallet.prototype.getPayments = function(pid) {
    let method = 'get_payments';
    let params = {};
    params.payment_id = pid;
    return this._body(method, params);
};

// get a list of incoming payments using a single payment ID or list of payment IDs from a given height
MoneroWallet.prototype.getBulkPayments = function(pids, minHeight) {
    let method = 'get_bulk_payments';
    let params = {};
    params.payment_ids = pids;
    params.min_block_height = minHeight;
    return this._body(method, params);
};

// return a list of incoming transfers to the wallet (type can be "all", "available", or "unavailable")
MoneroWallet.prototype.incomingTransfers = function(type) {
    let method = 'incoming_transfers';
    let params = {};
    params.transfer_type = type;
    return this._body(method, params);
};

// return the spend key or view private key (type can be 'mnemonic' seed or 'view_key')
MoneroWallet.prototype.queryKey = function(type) {
    let method = 'query_key';
    let params = {};
    params.key_type = type;
    return this._body(method, params);
};

// make an integrated address from the wallet address and a payment id
MoneroWallet.prototype.integratedAddress = function(pid) {
    let method = 'make_integrated_address';
    let params = {};
    params.payment_id = pid;
    return this._body(method, params);
};

// retrieve the standard address and payment id from an integrated address
MoneroWallet.prototype.splitIntegrated = function(address) {
    let method = 'split_integrated_address';
    let params = {};
    params.integrated_address = address;
    return this._body(method, params);
};

// return the current block height
MoneroWallet.prototype.height = function() {
    let method = 'getheight';
    return this._body(method);
};

// stop the current simplewallet process
MoneroWallet.prototype.stopWallet = function() {
    let method = 'stop_wallet';
    return this._body(method);
};

module.exports = MoneroWallet;



