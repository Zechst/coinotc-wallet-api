var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');


var WalletSchema = new mongoose.Schema({
  email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  eth: mongoose.Schema.Types.Mixed,
  monero: mongoose.Schema.Types.Mixed,
  cardano: mongoose.Schema.Types.Mixed,
  ripple: mongoose.Schema.Types.Mixed,
  stellar: mongoose.Schema.Types.Mixed,
  btc:mongoose.Schema.Types.Mixed
}, {collection: 'wallets', timestamps: true});

WalletSchema.plugin(uniqueValidator, {message: 'is already taken.'});

mongoose.model('Wallet', WalletSchema, 'wallets');