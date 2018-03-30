var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var CryptoCurrencySchema = new mongoose.Schema({
  code: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], index: true},
  desc: String
}, {timestamps: true});

CryptoCurrencySchema.plugin(uniqueValidator, {message: 'is already taken.'});

mongoose.model('Cryptocurrency', CryptoCurrencySchema);