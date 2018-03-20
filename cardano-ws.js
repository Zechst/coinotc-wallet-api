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
const logger = require('./util/logger');

const app = express();
var b64c = config.cardanoHexRand;
var utils = new Util();
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
    logger.error('errored' + error);
    if (error.errno) return;
    throw error;
  });

  ws.on('close', function(){
    logger.info("client closed connection!");
  });

  ws.on('message', function incoming(message) {
    logger.debug('received: %s', message);
    var txnMessage = JSON.parse(message);

      if(txnMessage.type === 'accounts'){
          logger.debug("accounts ...");
          options.method = 'GET';
          options.path = '/api/accounts';
          logger.debug("accounts ...");
          var accountsReq = https.request(options, function(res) {
              logger.debug("res"  + res);
              res.on('data', function(data) {
                  process.stdout.write(data);
                  logger.debug('\n');
                  var result = JSON.parse(data);
              });
          });
          accountsReq.end();
      } else if(txnMessage.type === 'wallets'){
        logger.debug("wallets ...");
        options.method = 'GET';
        options.path = '/api/wallets';
        logger.debug("wallets ...");
        var walletsReq = https.request(options, function(res) {
            logger.debug("res"  + res);
            res.on('data', function(data) {
                process.stdout.write(data);
                logger.debug('\n');
                var result = JSON.parse(data);
            });
        });
        walletsReq.end();
    } else if(txnMessage.type === 'balance'){
      logger.debug("balance ...");
      options.method = 'GET';
      options.path = '/api/wallets/' + txnMessage.walletId;
      logger.debug("before ...");
      var balreq = https.request(options, function(res) {
          logger.debug("res"  + res);
          res.on('data', function(data) {
              process.stdout.write(data);
              logger.debug('\n');
              var result = JSON.parse(data);
              logger.debug(result.Right.cwAmount.getCCoin);
          });
      });
      balreq.end();
    } else if( txnMessage.type === 'new') {
        var mnemonic = bip39.generateMnemonic();
        var bpListArr = mnemonic.split(' ');
        logger.debug(bpListArr);
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

        var encodedPassphrase = utils.toHexBase16(txnMessage.passphrase);

        options.path = '/api/wallets/new?passphrase=' + encodedPassphrase;
        logger.debug(options.path);
        logger.debug(JSON.stringify(postData).length);
        options.headers = {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(postData).length
        };
        options.json = true;
        options.body = JSON.stringify(postData);

        submitRequest(options, postData, ws, txnMessage.email);

    } else if( txnMessage.type === 'transfer') {
        logger.debug('transfer --- ');
          var postData = {"groupingPolicy": "OptimizeForSecurity"};

          options.method = 'POST';

          var fromAddress = txnMessage.fromAddress;
          var toAddress = txnMessage.toAddress;
          var amount = txnMessage.amount;
          var encodedPassphrase = utils.toHexBase16(txnMessage.passphrase);
          options.path = '/api/txs/payments/'+ fromAddress +'/' + toAddress + '/' + amount
              + '?passphrase=' + encodedPassphrase;
          logger.debug(options.path);
          logger.debug(JSON.stringify(postData).length);
          options.headers = {
              'Content-Type': 'application/json',
              'Content-Length': JSON.stringify(postData).length
          };
          options.json = true;
          options.body = JSON.stringify(postData);
          submitRequest(options, postData, ws, txnMessage.email);

     } else if (txnMessage.type === 'fee'){
        logger.debug('fee --- ');
        var postData = {"groupingPolicy": "OptimizeForSecurity"};

        options.method = 'POST';

        var fromAddress = txnMessage.fromAddress;
        var toAddress = txnMessage.toAddress;
        var amount = txnMessage.amount;

        options.path = '/api/txs/fee/'+ fromAddress +'/' + toAddress + '/' + amount;
        logger.debug(options.path);
        logger.debug(JSON.stringify(postData).length);
        options.headers = {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(postData).length
        };
        options.json = true;
        options.body = JSON.stringify(postData);
         submitRequest(options, postData, ws, txnMessage.email);
    }

  });

});

server.listen(8080, function listening() {
  logger.debug('Cardano Engine Listening on %d', server.address().port);
});

function submitRequest(options, postData, _ws, emailAddress){
    var newAccReq = https.request(options, function (res) {
        res.on('data', function(data) {
            process.stdout.write("???>>>" + data);
            logger.debug("sending back to the client ...");
            var _result = JSON.parse(data);
            postData.result = _result;
            postData.email = emailAddress;
            logger.debug(JSON.stringify(postData));
            _ws.send(JSON.stringify(postData));
        });
    });

    newAccReq.on('error', function (e) {
        console.error(e);
    });

    newAccReq.write(JSON.stringify(postData), encoding = 'utf8');
    newAccReq.end();

}
