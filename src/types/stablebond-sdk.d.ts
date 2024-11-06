declare module '@etherfuse/stablebond-sdk' {
    import { Connection, PublicKey } from '@solana/web3.js';
    import { WalletContextState } from '@solana/wallet-adapter-react';
    
    export class StablebondSDK {
      constructor(options: {
        connection: Connection;
        wallet: WalletContextState;
      });
      
      getStablebondBalance(publicKey: PublicKey): Promise<number>;
    }
  }
  