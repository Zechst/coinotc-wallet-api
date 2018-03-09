module.exports = {
    secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'password@123456',
    monero_hostname: process.env.MONERO_HOSTNAME,
    monero_port: process.env.MONERO_PORT,
    ether_geth_rpc : process.env.ETH_RPC | 'http://localhost:8545',
    ether_geth_hostname: process.env.GETH_ADDRESS | 'localhost',
    ether_geth_port: process.env.GETH_PORT | '8545',
    ether_testnet: process.env.ETHTESTNET | true,
    riple_api_address: process.env.RIPPLE_API | 'wss://s1.ripple.com',
    mongodb_url: process.env.MONGODB_URI | 'mongodb://localhost/walletapi',
    mongodb_debug: Boolean(process.env.MONGODB_DEBUG) | true,
    cardanoWSAddress: process.env.CARDANO_WS_ADDRESS | 'ws://aeeded7e.ngrok.io',
    cardanoHexRand: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    cardanoCertificateKey: 'certificates/client.key',
    cardanoCertificateCert: 'certificates/client.crt',
    api_port: process.env.PORT | 3000
};
