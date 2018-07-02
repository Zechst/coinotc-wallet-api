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
      env: {
        NODE_TLS_REJECT_UNAUTHORIZED: 0,
      },
      script    : 'cardano-ws.js'
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
