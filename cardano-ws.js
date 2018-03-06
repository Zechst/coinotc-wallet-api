const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const bip39 = require('bip39');
const url = require('url');
const WebSocket = require('ws');
const util = require('util');
const bs58 = require('bs58');
const config = require('./config');
const Util = require('./util');

const app = express();
var b64c = config.cardanoHexRand;

var options = {
    hostname: config.cardanoWSAddress,
    port: config.cardanoWSPort,
    key:   fs.readFileSync(config.cardanoCertificateKey),  // Secret client key
    cert:  fs.readFileSync(config.cardanoCertificateCert),
};

app.use(function (req, res) {
  res.send({ msg: "hello this cardano api" });
});

const server = http.createServer(app);
server.timeout = 0;
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws, req) {
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
        console.log("wallets ...");
        options.method = 'GET';
        options.path = '/api/wallets';
        console.log("wallets ...");
        var walletsReq = https.request(options, function(res) {
            console.log("res"  + res);
            res.on('data', function(data) {
                process.stdout.write(data);
                console.log('\n');
                var result = JSON.parse(data);
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
          });
      });
      balreq.end();
    } else if( txnMessage.type === 'new') {
        var mnemonic = bip39.generateMnemonic();
        var bpListArr = mnemonic.split(' ');
        console.log(bpListArr);
        var postData = {
            "cwInitMeta": {
                "cwName": "test1",
                "cwAssurance": "CWAStrict",
                "cwUnit": 0
            },
            "cwBackupPhrase": {
                "bpToList": bpListArr
            }
        }
        options.method = 'POST';

        var encodedPassphrase = Util.toHexBase16(txnMessage.passphrase);

        options.path = '/api/wallets/new?passphrase=' + encodedPassphrase;
        console.log(options.path);
        console.log(JSON.stringify(postData).length);
        options.headers = {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(postData).length
        };
        options.json = true;
        options.body = JSON.stringify(postData);

        submitRequest(options, postData);

    } else if( txnMessage.type === 'transfer') {
        console.log('transfer --- ');
          var postData = {"groupingPolicy": "OptimizeForSecurity"};

          options.method = 'POST';

          var fromAddress = txnMessage.fromAddress;
          var toAddress = txnMessage.toAddress;
          var amount = txnMessage.amount;
          var encodedPassphrase = Util.toHexBase16(txnMessage.passphrase);
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
          submitRequest(options, postData);
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
        submitRequest(options, postData);
    }

  });

});

server.listen(8080, function listening() {
  console.log('Cardano Engine Listening on %d', server.address().port);
});

function submitRequest(options, postData){
    var newAccReq = https.request(options, function (res) {
        res.on('data', function(data) {
            console.log('! !');
            process.stdout.write("???>>>" + data);
        });
    });

    newAccReq.on('error', function (e) {
        console.error(e);
    });

    newAccReq.write(JSON.stringify(postData), encoding = 'utf8');
    newAccReq.end();
}
