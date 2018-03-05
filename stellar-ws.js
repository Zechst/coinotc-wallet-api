const WebSocket = require('ws');
const chalk = require('chalk');
const wss = new WebSocket.Server({ port: 8081 });
var StellarSdk = require('stellar-sdk');
const StellarSDK_Server = process.env.STELLAR_SERVER || 'https://horizon-testnet.stellar.org';
const server = new StellarSdk.Server(StellarSDK_Server);
StellarSdk.Config.setDefault();
StellarSdk.Network.useTestNetwork();
const currencyType = StellarSdk.Asset.native()

const fail = (message) => {
    console.log("<><><>" + message);
    console.log(typeof message.name);
    console.log(message.name);
    if(message.name != 'Error'){
      console.log(JSON.stringify(message.data.extras.result_codes));
    }
    console.error(chalk.red(message.name), '\n')
}

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    let incomingObj = JSON.parse(message);
    
    if(incomingObj.type == 'generateAddress'){

      const account = StellarSdk.Keypair.random();
      console.log('  Public address:', chalk.yellow(account.publicKey()))
      console.log('  Wallet secret:', chalk.yellow(account.secret()), '\n')

      console.log(chalk.red('  Print this wallet and make sure to store it somewhere safe!'), '\n')
      console.log('  Note: You need to put at least 20XLM on this key for it to be an active account', '\n')
      let stellarGeneratedWallet = {
          public_address: account.publicKey(), 
          wallet_secret: account.secret()
      }
      ws.send(JSON.stringify(stellarGeneratedWallet));
    }

    if(incomingObj.type == 'balance'){
        console.log(incomingObj.walletAddress);
        server.loadAccount(incomingObj.walletAddress).then(function(account){
          account.balances.forEach((balance) => {
            console.log(balance);
            if (balance.balance > 0) {
              console.log('  ' + chalk.green(incomingObj.walletAddress));
              console.log('  ' + chalk.green(balance.balance, balance.asset_code || 'XLM'));
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
                console.log('\nSuccess! View the transaction at: ')
                console.log(chalk.yellow(transactionResult._links.transaction.href), "\n")
                ws.send(JSON.stringify(transactionResult));
            })
            .catch((message)=>{
              console.log(message);
            });

      }).catch(fail);
    }
  }); 
});