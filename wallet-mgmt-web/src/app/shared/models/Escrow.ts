export class Escrow {
    constructor(
        public escrowWalletAddress: string,
        public privateKey: string,
        public cryptoType: string,
        public feeRate: Number,
        public status: string,
        public authorizeCode: string,
        public unauthorizedEscrowWalletAddress: string,
        public unauthorizedEscrowPrivateKey: string,
        public unauthorizedFeeRate: Number,
        public unauthorizedStatus: string,
        public _id?: String
    ){

    }
}