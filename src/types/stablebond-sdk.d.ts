declare module '@etherfuse/stablebond-sdk' {
    import { Connection, PublicKey } from '@solana/web3.js';
    
    export class StablebondSDK {
      constructor(options: {
        connection: Connection;
        wallet: any;
      });
      
      getStablebondBalance(publicKey: PublicKey): Promise<number>;
    }
  }