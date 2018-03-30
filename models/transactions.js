var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');

var TransactionsSchema = new mongoose.Schema({
  orderNo: {type: String, unique: true, required: [true, "can't be blank"], index: true},
  email: {type: String, lowercase: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  fromAddress: {type: String, required: [true, "can't be blank"], index: true},
  toAddress: {type: String, required: [true, "can't be blank"], index: true},
  unit: Number,
  equivalentAmount: Number,
  transactCurrency: String,
  cryptoCurrency: String,
  transactionFee: Number,
  platformFee: Number,
  escrowId: String,
  beneficiaryEmail: String,
  status: Number,
  memo: String

}, {timestamps: true});

TransactionsSchema.plugin(uniqueValidator, {message: 'is already taken.'});

mongoose.model('Transactions', TransactionsSchema);
