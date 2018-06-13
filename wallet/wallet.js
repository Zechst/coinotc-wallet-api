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
    logger.debug("METHOD >>>> " + body.method);
    logger.debug("params> " + JSON.stringify(body.params));
    
    // set basic headers
    let headers = {};
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = Buffer.byteLength(requestJSON, 'utf8');
    console.log("type of > " + typeof(body.params));
    
    if(typeof(body.params) === 'object' && typeof(body.params.orderNo) !== 'undefined'){
        headers['coinotc-orderNo'] = body.params.orderNo;
    }

    if(typeof(body.params) === 'object' && typeof(body.params.walletId) !== 'undefined'){
        console.log(">>>  >>>>" + body.params.walletId);
        headers['walletId'] = body.params.walletId;
    }
        
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
                console.log(options.headers);
                let body = JSON.parse(data);
                if(body && body.result) {
                    logger.debug("1xxxxxxxx" + JSON.stringify(body.result));
                    logger.debug("11" + JSON.stringify(body));
                    resolve(body.result);
                    if(typeof(body.result.amount) !== 'undefined'){
                        evtEmitter.emit('transferEvt',{result: body.result, orderNo: options.headers['coinotc-orderNo']});
                    }else{
                        console.log("???? " + body.method);
                        console.log("????x " + options.headers['coinotc-orderNo']);
                        console.log("????y " + options.headers['walletId']);
                        if(typeof(options.headers['walletId']) !== 'undefined'){
                            evtEmitter.emit('walletEvt',{result: body.result, walletId: options.headers['walletId']});
                        }else{
                            evtEmitter.emit('walletEvt',{result: body.result});
                        }   
                    }
                } else if (body && body.error) {
                    logger.debug("2" + JSON.stringify(body.error));
                    reject(body.error);
                    evtEmitter.emit('transferEvtError',{result: body.error, orderNo: options.headers['coinotc-orderNo']});
                } else {
                    logger.debug("3" + body.error);
                    reject('Wallet response error. Please try again.');
                    evtEmitter.emit('transferEvtError',{result: body.error, orderNo: options.headers['coinotc-orderNo']});
                }
            });
        });
        req.on('error', (e) => {
            console.log("ERROR !");
            reject(e);
            evtEmitter.emit('transferEvtError',{result: e, orderNo: options.headers['coinotc-orderNo']});
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