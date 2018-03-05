var StellarSdk = require('stellar-sdk');
const chalk = require('chalk');

var keypair = StellarSdk.Keypair.fromSecret('SD2KAXP63EICTKJZMBY3YJM5G5QYTQ37WPFLYY2TWUEEA3IE3YUUSDHE');
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
StellarSdk.Config.setDefault();
StellarSdk.Network.useTestNetwork();
//console.log(keypair);
const currencyType = StellarSdk.Asset.native()

const fail = (message) => {
    console.log(message);
    console.log(JSON.stringify(message.data.extras.result_codes));
    console.error(chalk.red(message.name), '\n')
}

server.loadAccount('GDX6O4JFB5QWZATTT45FWBUI5RD7IS56CCEMVKX2V6JVYXRVE2PUUUJI')
.then((account) => {
    console.log(account);
    
}).catch(fail);

/*
server.loadAccount('GCSCSIKV2ZDRNMLF4M4ITCFRLSVGRR6E2ZXE47OKD2B7V5XGAC6QON4I')
.then((account) => {
    console.log(account);
    const sourceKeypair = StellarSdk.Keypair.fromSecret('SD2KAXP63EICTKJZMBY3YJM5G5QYTQ37WPFLYY2TWUEEA3IE3YUUSDHE');
    let transaction = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.createAccount({
        destination: "GDX6O4JFB5QWZATTT45FWBUI5RD7IS56CCEMVKX2V6JVYXRVE2PUUUJI",
        asset: currencyType,
        startingBalance: "300"
    }));
    transaction = transaction.addMemo(StellarSdk.Memo.text('test'))
    transaction = transaction.build();
    transaction.sign(sourceKeypair);
    console.log(server);
    server.submitTransaction(transaction)
        .then((transactionResult) => {
        console.log('\nSuccess! View the transaction at: ')
        console.log(chalk.yellow(transactionResult._links.transaction.href), "\n")
    })
    .catch(fail)

}).catch(fail);
*/

server.loadAccount('GCSCSIKV2ZDRNMLF4M4ITCFRLSVGRR6E2ZXE47OKD2B7V5XGAC6QON4I')
.then((account) => {
    console.log(account);
    const sourceKeypair = StellarSdk.Keypair.fromSecret('SD2KAXP63EICTKJZMBY3YJM5G5QYTQ37WPFLYY2TWUEEA3IE3YUUSDHE');
    let transaction = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.payment({
        destination: "GDX6O4JFB5QWZATTT45FWBUI5RD7IS56CCEMVKX2V6JVYXRVE2PUUUJI",
        asset: currencyType,
        amount: "100.50"
    }));
    transaction = transaction.addMemo(StellarSdk.Memo.text('test'))
    transaction = transaction.build();
    transaction.sign(sourceKeypair);
    console.log(server);
    server.submitTransaction(transaction)
        .then((transactionResult) => {
        console.log('\nSuccess! View the transaction at: ')
        console.log(chalk.yellow(transactionResult._links.transaction.href), "\n")
    })
    .catch(fail)

}).catch(fail);

