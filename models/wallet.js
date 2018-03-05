var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');

var WalletSchema = new mongoose.Schema({
  email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  publicAddress: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], index: true},
  privateKey: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], index: true},
  destinationTag: String,
  passphrase: String,
  paymentId: String,
  cryptoCurrency: String
}, {timestamps: true});

WalletSchema.plugin(uniqueValidator, {message: 'is already taken.'});

mongoose.model('Wallet', WalletSchema);