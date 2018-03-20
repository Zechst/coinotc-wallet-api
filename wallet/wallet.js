'user strict'

const evtEmitter = require('../util/evtemitter');
const http = require('http');
const Promise = require("bluebird");
const logger = require('../util/logger');

var promises = [];

class Wallet {
    constructor(hostname, port){
        this.hostname = hostname || '127.0.0.1';
        this.port = port || 18082;
    }
}

// general Wallet API request
Wallet.prototype._request = function (body){
    // encode the request into JSON
    let requestJSON = JSON.stringify(body);
    //logger.debug(requestJSON);
    logger.debug(body.method);
    logger.debug(body.params);
    // set basic headers
    let headers = {};
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = Buffer.byteLength(requestJSON, 'utf8');

    // make a request to the wallet
    let options = {
        hostname: this.hostname,
        port: this.port,
        path: '/json_rpc',
        method: 'POST',
        headers: headers
    };
    let requestPromise = new Promise((resolve, reject) => {
        let data = '';
        let req = http.request(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', function() {
                let body = JSON.parse(data);
                if(body && body.result) {
                    logger.debug("1" + JSON.stringify(body.result));
                    logger.debug("11" + JSON.stringify(body));
                    resolve(body.result);
                    evtEmitter.emit('walletEvt',{result: body.result});
                } else if (body && body.error) {
                    //logger.debug("2" + JSON.stringify(body.error));
                    reject(body.error);
                } else {
                    //logger.debug("3" + body.error);
                    reject('Wallet response error. Please try again.');
                }
            });
        });
        req.on('error', (e) => {
            reject(e)
        });
        req.write(requestJSON);
        req.end();
    });
    promises.push(requestPromise);
    //return requestPromise;
    Promise.map(promises, function(requestPromise) {
        // Promise.map awaits for returned promises as well.
        return requestPromise;
    }).then(function() {
        logger.info("done");
    });
}


// build request body
Wallet.prototype._body = function (method, params) {
    let body = {
        jsonrpc: '2.0',
        id: '0',
        method: method,
        params: params
    };
    return this._request(body);
};

// helper function to convert Monero amount to atomic units
Wallet.prototype._convert = function convert(amount) {
    let number = Number(amount) * 1e12;
    // remove any decimals
    number = number.toFixed(0);
    return Number(number);
}


module.exports = Wallet;