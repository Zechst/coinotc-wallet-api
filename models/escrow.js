var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var TransactionsSchema = new mongoose.Schema({
  escrowWalletAddress: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], index: true},
  chargeRate: Number
}, {timestamps: true});

TransactionsSchema.plugin(uniqueValidator, {message: 'is already taken.'});

mongoose.model('escrow', TransactionsSchema);
