'user strict'

var http = require('http');

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
                    console.log(body.result);
                    resolve(body.result);
                } else if (body && body.error) {
                    resolve(body.error);
                } else {
                    resolve('Wallet response error. Please try again.');
                }
            });
        });
        req.on('error', (e) => resolve(e));
        req.write(requestJSON);
        req.end();
    });

    return requestPromise;
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