var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');

var TransactionsSchema = new mongoose.Schema({
  orderNo: {type: String, unique: true, required: [true, "can't be blank"], index: true},
  email: {type: String, lowercase: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid']},
  fromAddress: {type: String, required: [true, "can't be blank"]},
  toAddress: {type: String, required: [true, "can't be blank"]},
  unit: {type: Number, required: [true, "can't be blank"]},
  equivalentAmount: Number,
  transactCurrency: String,
  cryptoCurrency: String,
  transactionFee: Number,
  platformFee: Number,
  escrowId: String,
  beneficiaryEmail: String,
  receipt: mongoose.Schema.Types.Mixed,
  finalReceipt: mongoose.Schema.Types.Mixed,
  status: Number,
  memo: String,
  error: String

}, {strict: false, timestamps: true});

TransactionsSchema.plugin(uniqueValidator, {message: 'is already taken.'});

mongoose.model('Transactions', TransactionsSchema);
