module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : 'RippleWS',
      script    : 'ripple-ws.js'
    },

    {
      name      : 'StellarWS',
      script    : 'stellar-ws.js'
    },

    {
      name      : 'CardanoWS',
      script    : './scripts/startCardanoEngine.sh'
    },

    {
      name      : 'WalletAPI',
      script    : 'app.js',
      env_production : {
        NODE_ENV: 'production'
      }
    }
  ],
};
