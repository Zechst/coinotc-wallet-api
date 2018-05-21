source .env;

sh -x $WORKDIR/scripts/startMongodb.sh & $WORKDIR/scripts/startRippleEngine.sh & $WORKDIR/scripts/startStellarEngine.sh & $WORKDIR/scripts/startGeth.sh & $WORKDIR/scripts/startMoneroNode.sh & $WORKDIR/scripts/startMoneroWalletRPC.sh & $WORKDIR/scripts/startCardanoSL.sh & $WORKDIR/scripts/startCardanoEngine.sh & $WORKDIR/scripts/startADANgrok.sh & $WORKDIR/scripts/startWalletAPI.sh