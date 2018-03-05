var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');

var TransactionsSchema = new mongoose.Schema({
  email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  fromAddress: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], index: true},
  toAddress: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], index: true},
  unit: Number,
  equivalentAmount: Number,
  transactCurrency: String,
  exchangeRate: Number,
  cryptoCurrency: String,
  memo: String

}, {timestamps: true});

TransactionsSchema.plugin(uniqueValidator, {message: 'is already taken.'});

mongoose.model('Transactions', TransactionsSchema);
