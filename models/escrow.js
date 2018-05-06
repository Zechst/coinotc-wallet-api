var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var EscrowSchema = new mongoose.Schema({
  cryptoType: {type: String, unique: true, required: [true, "can't be blank"], index: true},
  escrowWalletAddress: {type: String, required: [true, "can't be blank"]},
  privateKey: String,
  name: String,
  password: String,
  unauthorizedEscrowPrivateKey: String,
  unauthorizedEscrowPassword: String,
  unauthorizedEscrowWalletAddress: String,
  unauthorizedFeeRate: Number,
  feeRate: Number,
  authorizeCode: String,
  unauthorizedStatus: String,
  security: mongoose.Schema.Types.Mixed,
  status: String
}, {timestamps: true});

EscrowSchema.plugin(uniqueValidator, {message: 'is already taken.'});

mongoose.model('Escrow', EscrowSchema);
