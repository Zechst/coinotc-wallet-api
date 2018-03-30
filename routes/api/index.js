var router = require('express').Router();
const logger = require('../../util/logger');
router.use('/', require('./wallet-auth'));
router.use('/wallets', require('./wallets'));
router.use('/transactions', require('./transactions'));

router.use(function(err, req, res, next){
  if(err.name === 'ValidationError'){
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key){
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;
