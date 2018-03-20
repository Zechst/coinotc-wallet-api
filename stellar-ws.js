const dotenv = require('dotenv');
const dotenvParseVariables = require('dotenv-parse-variables');
const logger = require('./util/logger');

let env = dotenv.config({})
if (env.error) throw env.error;
env = dotenvParseVariables(env.parsed);

const WebSocket = require('ws');
const chalk = require('chalk');
const wss = new WebSocket.Server({ port: process.env.STELLAR_WS_PORT });
var StellarSdk = require('stellar-sdk');
const StellarSDK_Server = process.env.STELLAR_SERVER;
const server = new StellarSdk.Server(StellarSDK_Server);
StellarSdk.Config.setDefault();
StellarSdk.Network.useTestNetwork();
const currencyType = StellarSdk.Asset.native()

const fail = (message) => {
    logger.debug(typeof message.name);
    logger.debug(message.name);
    if(message.name != 'Error'){
      logger.debug(JSON.stringify(message.data.extras.result_codes));
    }
    console.error(chalk.red(message.name), '\n')
}

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    logger.debug('received: %s', message);
    let incomingObj = JSON.parse(message);
    
    if(incomingObj.type == 'generateAddress'){

      const account = StellarSdk.Keypair.random();
      logger.debug('  Public address:', chalk.yellow(account.publicKey()))
      logger.debug('  Wallet secret:', chalk.yellow(account.secret()), '\n')

      logger.debug(chalk.red('  Print this wallet and make sure to store it somewhere safe!'), '\n')
      logger.debug('  Note: You need to put at least 20XLM on this key for it to be an active account', '\n')
      let stellarGeneratedWallet = {
          type: 'generateAddress',
          public_address: account.publicKey(), 
          wallet_secret: account.secret(),
          email: incomingObj.email
      }
      ws.send(JSON.stringify(stellarGeneratedWallet));
    }

    if(incomingObj.type == 'balance'){
        logger.debug(incomingObj.walletAddress);
        server.loadAccount(incomingObj.walletAddress).then(function(account){
          account.balances.forEach((balance) => {
            logger.debug(balance);
            if (balance.balance > 0) {
              logger.debug('  ' + chalk.green(incomingObj.walletAddress));
              logger.debug('  ' + chalk.green(balance.balance, balance.asset_code || 'XLM'));
              var returnBalance = {
                currency: balance.asset_code,
                value: balance.balance,
              }
              ws.send(JSON.stringify(returnBalance));
            }
          })
        }).catch(fail)
    }

    if(incomingObj.type == 'transfer'){
      server.loadAccount(incomingObj.transfer.sourceAddress)
        .then((account) => {
            const sourceKeypair = StellarSdk.Keypair.fromSecret(incomingObj.transfer.sourceSecret);
            let transaction = new StellarSdk.TransactionBuilder(account)
                .addOperation(StellarSdk.Operation.payment({
                  destination: incomingObj.transfer.destinationAddress,
                  asset: currencyType,
                  amount: String(incomingObj.transfer.amount)
            }));
            transaction = transaction.addMemo(StellarSdk.Memo.text(incomingObj.transfer.memo))
            transaction = transaction.build();
            transaction.sign(sourceKeypair);
            server.submitTransaction(transaction)
                .then((transactionResult) => {
                logger.debug('\nSuccess! View the transaction at: ')
                logger.debug(chalk.yellow(transactionResult._links.transaction.href), "\n")
                ws.send(JSON.stringify(transactionResult));
            })
            .catch((message)=>{
              logger.debug(message);
            });

      }).catch(fail);
    }
  }); 
});