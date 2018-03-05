const RippleAPI = require('ripple-lib').RippleAPI;

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
  /* insert code here */

  api.getBalances('rGHXrYhVUrPrK71PgChbCEqCDvR1FiCCB3').then(balances => {
              balances.map((currency) => {
              	console.log('  ' + currency.value + ' ' +currency.currency);
              })
    }, fail)
}).catch(console.error);


const fail = (message) => {
  console.log(message);
}
