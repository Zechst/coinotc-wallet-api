FROM ubuntu:16.04

MAINTAINER Kenneth Phang "kenneth.phang@lemo.io"

WORKDIR /expressjs/src/github.com/coinotc-wallet-api
ENV COINOTC_BLOCKCHAIN_DIR=/media/kenneth/b13ae9f7-5727-4bc0-94fe-77d72079f2ee
ENV MONGODB_DIR=$COINOTC_BLOCKCHAIN_DIR/mongodb
ENV MONERO_CLI_DIR=$COINOTC_BLOCKCHAIN_DIR/monero
ENV CARDANO_SL_CLI_DIR=$COINOTC_BLOCKCHAIN_DIR/cardano-sl

# Update aptitude with new repo
RUN apt-get update

RUN apt-get install git -y

RUN apt-get install -y software-properties-common

RUN add-apt-repository -y ppa:ethereum/ethereum

RUN apt-get update

RUN apt-get install ethereum -y

RUN apt-get install -y curl libc6 libcurl3 zlib1g

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -

RUN apt-get install -y nodejs

RUN apt-get install -y build-essential

RUN git clone https://coinotc-docker:Password@123456@github.com/coinotc/coinotc-wallet-api.git $WORKDIR

RUN cd $WORKDIR

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add 

RUN apt-get update
RUN npm install -g yarn
RUN npm install -g nodemon
RUN yarn install

CMD pwd
RUN $WORKDIR/scripts/startMongodb.sh
RUN $WORKDIR/scripts/startRippleEngine.sh
RUN $WORKDIR/scripts/startStellarEngine.sh
RUN $WORKDIR/scripts/startGeth.sh
RUN $WORKDIR/scripts/startMoneroNode.sh
RUN $WORKDIR/scripts/startMoneroWalletRPC.sh
RUN $WORKDIR/scripts/startCardanoEngine.sh
RUN $WORKDIR/scripts/startADANgrok.sh
RUN $WORKDIR/scripts/startWalletAPI.sh

EXPOSE 3001/tcp