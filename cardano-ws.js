const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const bip39 = require('bip39');
const url = require('url');
const WebSocket = require('ws');
const util = require('util');
const bs58 = require('bs58');
const os = require('os');
var networkInterface = os.networkInterfaces();
console.log(networkInterface);
const app = express();
var b64c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

var options = {
    hostname: 'localhost',
    port: 8090,
    key:   fs.readFileSync('client.key'),  // Secret client key
    cert:  fs.readFileSync('client.crt'),
};

app.use(function (req, res) {
  res.send({ msg: "hello this cardano api" });
});

const server = http.createServer(app);
server.perMessageDeflate = {
        zlibDeflateOptions: { // See zlib defaults.
          chunkSize: 1024,
          memLevel: 7,
          level: 3,
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        clientMaxWindowBits: 10,       // Defaults to negotiated value.
        serverMaxWindowBits: 10,       // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10,          // Limits zlib concurrency for perf.
        threshold: 1024,               // Size (in bytes) below which messages
                                       // should not be compressed.
};
var wss = new WebSocket.Server({ server });

function noop() {}

function heartbeat(){
    this.Alive = true;
}
wss.on('connection', function connection(ws, req) {
  const location = url.parse(req.url, true);
  ws.isalive = true;

  ws.on('pong', heartbeat);

  // You might use location.query.access_token to authenticate or share sessions
  // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
   console.log("Connected!");
  ws.on('error', function(error) {
      console.log('errored' + error);
      if (error.errno) return;
      throw error;
  });

  ws.on('close', function(){
      console.log("client closed connection!");
  });

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    var txnMessage = JSON.parse(message);

      if(txnMessage.type === 'accounts'){
          console.log("accounts ...");
          options.method = 'GET';
          options.path = '/api/accounts';
          console.log("accounts ...");
          var accountsReq = https.request(options, function(res) {
              console.log("res"  + res);
              res.on('data', function(data) {
                  process.stdout.write(data);
                  console.log('\n');
                  var result = JSON.parse(data);
              });
          });
          accountsReq.end();
      } else if(txnMessage.type === 'wallets'){
        //console.log("wallets ...");
        options.method = 'GET';
        options.path = '/api/wallets';
        //console.log("wallets ...");
        var walletsReq = https.request(options, function(res) {
            //console.log("res"  + res);
            res.on('data', function(data) {
                //process.stdout.write(data);
                data.txnMessage = txnMessage;
                //var result = _parseJSON(data);
                console.log('\n'  + data);
                ws.send(JSON.stringify(data));
            });
        });
        walletsReq.end();
    } else if(txnMessage.type === 'balance'){
      console.log("balance ...");
      options.method = 'GET';
      options.path = '/api/wallets/' + txnMessage.walletId;
      console.log("before ...");
      var balreq = https.request(options, function(res) {
          console.log("res"  + res);
          res.on('data', function(data) {
              process.stdout.write(data);
              console.log('\n');
              var result = JSON.parse(data);
              console.log(result.Right.cwAmount.getCCoin);
              result.txnMessage = txnMessage;
              ws.send(JSON.stringify(result));
          });
      });
      balreq.end();
    } else if( txnMessage.type === 'new') {
        var mnemonic = bip39.generateMnemonic();
        var bpListArr = mnemonic.split(' ');
        console.log(bpListArr);
        var postData = {
            "cwInitMeta": {
                "cwName": txnMessage.email,
                "cwAssurance": "CWAStrict",
                "cwUnit": 0
            },
            "cwBackupPhrase": {
                "bpToList": bpListArr
            }
        }
        options.method = 'POST';

        var encodedPassphrase = toHexBase16(txnMessage.passphrase);

        options.path = '/api/wallets/new?passphrase=' + encodedPassphrase;
        console.log(options.path);
        console.log(JSON.stringify(postData).length);
        options.headers = {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(postData).length
        };
        options.json = true;
        options.body = JSON.stringify(postData);

        submitRequestForNewAcc(options, postData, ws, txnMessage);

    } else if( txnMessage.type === 'transfer') {
        console.log('transfer --- ');
          var postData = {"groupingPolicy": "OptimizeForHighThroughput"};

          options.method = 'POST';

          var fromAddress = txnMessage.fromAddress;
          var toAddress = txnMessage.toAddress;
          var amount = txnMessage.amount;
          console.log("AMOUNT FOR ADA !!!" + amount);
          var encodedPassphrase = toHexBase16(txnMessage.passphrase);
          console.log(txnMessage.passphrase);
          console.log(encodedPassphrase);
          options.path = '/api/txs/payments/'+ fromAddress +'/' + toAddress + '/' + amount
              + '?passphrase=' + encodedPassphrase;
          console.log(options.path);
          console.log(JSON.stringify(postData).length);
          options.headers = {
              'Content-Type': 'application/json',
              'Content-Length': JSON.stringify(postData).length
          };
          options.json = true;
          options.body = JSON.stringify(postData);
          submitRequest(options, postData, ws, txnMessage);
     } else if (txnMessage.type === 'fee'){
        console.log('fee --- ');
        var postData = {"groupingPolicy": "OptimizeForSecurity"};

        options.method = 'POST';

        var fromAddress = txnMessage.fromAddress;
        var toAddress = txnMessage.toAddress;
        var amount = txnMessage.amount;

        options.path = '/api/txs/fee/'+ fromAddress +'/' + toAddress + '/' + amount;
        console.log(options.path);
        console.log(JSON.stringify(postData).length);
        options.headers = {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(postData).length
        };
        options.json = true;
        options.body = JSON.stringify(postData);
        submitRequest(options, postData, ws, txnMessage);
    }

  });

});

const interval = setInterval(function ping(){
    wss.clients.forEach(function each(ws){
        if(ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.ping(noop);
    })
}, 30000);

server.listen(8077, '127.0.0.1', function listening() {
    console.log('Cardano Engine Server %s', JSON.stringify(server.address()));
    console.log('Cardano Engine Listening on %d', server.address().port);
});

function toHexBase16(s) {
    // utf8 to latin1
    var s = unescape(encodeURIComponent(s))
    var h = ''
    for (var i = 0; i < s.length; i++) {
        h += s.charCodeAt(i).toString(16)
    }
    return h
}

function submitRequestForNewAcc(options, postData, _ws, _txnMessage){
    var newAccReq = https.request(options, function (res) {
        res.on('data', function(data) {
            process.stdout.write("submitRequestForNewAcc <<< ???>>>" + data);
            options.method = 'GET';
            options.path = '/api/accounts';
            var _result = JSON.parse(data);
            var walletsReq = https.request(options, function(res) {
                res.on('data', function(accounts) {
                    var _accounts = JSON.parse(accounts);
                    var counter;
                    var foundAccountAddress = null;
                    for (counter = 0; counter < _accounts.Right.length; counter++) {
                        let _caId = _accounts.Right[counter]['caId'];
                        let cwIdArr = _caId.split('@');
                        if(_result.Right.cwId === cwIdArr[0]){
                            foundAccountAddress = _accounts.Right[counter];
                            break;
                        }
                    }
                    postData.result = _result;
                    postData.txnMessage = _txnMessage;
                    if(foundAccountAddress != null){
                        postData.accountInfo = foundAccountAddress;
                    }
                    if (_ws.readyState === _ws.OPEN) {
                        _ws.send(JSON.stringify(postData));
                     }
                });
            });
            walletsReq.end();
        });
    });

    newAccReq.on('error', function (e) {
        console.error(e);
    });

    newAccReq.write(JSON.stringify(postData), encoding = 'utf8');
    newAccReq.end();
}

function submitRequest(options, postData, _ws, _txnMessage){
    try{
        var newAccReq = https.request(options, function (res) {
            res.on('data', function(data) {
                console.log('! !');
                process.stdout.write("???>>>" + data);
                console.log("sending back to the client ...");
                var _result = JSON.parse(data);
                postData.result = _result;
                //delete _txnMessage.passphrase;
                postData.txnMessage = _txnMessage;
                console.log(JSON.stringify(postData));
                if (_ws.readyState === _ws.OPEN) {
                    _ws.send(JSON.stringify(postData));
                }
            });
        });
    
        newAccReq.on('error', function (e) {
            console.error(e);
        });
    
        newAccReq.write(JSON.stringify(postData), encoding = 'utf8');
        newAccReq.end();
    }catch(error){
        console.log(error);
    }
}
