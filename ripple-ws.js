const RippleAPI = require('ripple-lib').RippleAPI;
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const _get = require('lodash.get')
const currency = 'XRP'
const maxFee = '0.15'
/*
  https://ripple.com/build/xrp-test-net/
*/

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    let incomingObj = JSON.parse(message);
    //console.log(api);
    const api = new RippleAPI({
      server: 'wss://s.altnet.rippletest.net:51233' // Public rippled server hosted by Ripple, Inc.
    });

    api.on('error', (errorCode, errorMessage) => {
      console.log(errorCode + ': ' + errorMessage);
    });
    
    api.on('connected', () => {
      console.log('connected');
    });
    
    api.on('disconnected', (code) => {
      // code - [close code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent) sent by the server
      // will be 1000 if this was normal closure
      console.log('disconnected, code:', code);
    });

    api.connect().then(() => {
  	
      if(incomingObj.type == 'generateAddress'){
        const account = api.generateAddress();
        //console.log(account);
        let generateAddressJson = {
          type: 'generateAddress',
          account: account,
          email: incomingObj.email
        }
        ws.send(JSON.stringify(generateAddressJson));
        api.disconnect();
      }

      if(incomingObj.type == 'balance'){
          console.log(incomingObj.walletAddress);
          api.getBalances(incomingObj.walletAddress).then(balances => {
              balances.map((currency) => {
                console.log('  ' + currency.value + ' ' + currency.currency)
                var returnBalance = {
                  currency: currency.currency,
                  value: currency.value,
                }
                ws.send(JSON.stringify(returnBalance));
                api.disconnect();
              })
          }, fail)
      }

      if(incomingObj.type == 'transfer'){
        const instructions = {
            maxLedgerVersionOffset: 5,
            maxFee
        }
  
        const payment = {
            source: {
              address: incomingObj.transfer.sourceAddress,
              maxAmount: {
                value: incomingObj.transfer.amount.toString(),
                currency
              }
            },
            destination: {
              address: incomingObj.transfer.destinationAddress,
              tag: incomingObj.transfer.destinationTag || undefined,
              amount: {
                value: incomingObj.transfer.amount.toString(),
                currency
              }
            }
        }

        api.preparePayment(incomingObj.transfer.sourceAddress, payment, instructions).then(prepared => {

          const { signedTransaction } = api.sign(prepared.txJSON, incomingObj.transfer.sourceSecret)
          console.log('Submitting payment...')
          api.submit(signedTransaction).then(() => {
            //waitForBalancesUpdate(sourceAddress, answers.destinationAddress, sourceBalance)
            console.log('Ok submitted ripple');
            ws.send(JSON.stringify(signedTransaction));
            api.disconnect();
          }, fail)

        });
      }
    }).catch(console.error);
  });
});

const fail = (message) => {
  console.log(message);
}
