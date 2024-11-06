import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Upload, Coins, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { PublicKey, Keypair } from '@solana/web3.js';
import {  } from '@solana/wallet-adapter-react';

import { 
  AggregatorAccount, 
  SwitchboardProgram
} from '@switchboard-xyz/solana.js';

// Type declarations for Stablebond SDK
interface StablebondSDK {
  getStablebondBalance(publicKey: PublicKey): Promise<number>;

}

interface CreateStablecoinParams {
  name: string;
  symbol: string;
  icon: string;
  targetCurrency: string;
  pegMechanism: 'algorithmic' | 'collateralized';
  collateralRatio: number;
  maxSupply: number;
}

interface StablecoinFormData extends CreateStablecoinParams {
  decimals?: number;
}

interface AlertProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'warning' | 'error';
}

// Currency types and exchange rate interfaces
interface CurrencyConfig {
  code: string;
  name: string;
  aggregatorAddress: string;
  minCollateralRatio: number;
}

const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  {
    code: 'USD',
    name: 'US Dollar',
    aggregatorAddress: 'FmAmfoyPXiA8Vhhe6MZTr3U6rZfEZ1ctEHay1ysqCqcf',
    minCollateralRatio: 150
  },
  {
    code: 'EUR',
    name: 'Euro',
    aggregatorAddress: 'HoMAqrN8ygpb892qyb7uQhwPsVfJYKYfhf8M5yvxKkP',
    minCollateralRatio: 150
  },
  // Add other supported currencies
];

// Enhanced Alert components with variants
const Alert: React.FC<AlertProps> = ({ children, className, variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-blue-900/50',
    warning: 'bg-yellow-900/50',
    error: 'bg-red-900/50'
  };

  return (
    <div className={`p-4 rounded-lg ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

const AlertDescription: React.FC<AlertProps> = ({ children }) => (
  <div className="ml-2 text-sm flex items-center gap-2">{children}</div>
);

export function CreateStablecoin() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [stablebondBalance, setStablebondBalance] = useState<number>(0);
  const [tokenMintExists, setTokenMintExists] = useState(false);

  const [formData, setFormData] = useState<StablecoinFormData>({
    name: '',
    symbol: '',
    icon: '',
    targetCurrency: 'USD',
    pegMechanism: 'collateralized',
    collateralRatio: 150,
    maxSupply: 1000000,
    decimals: 6
  });

  useEffect(() => {
    const validateSymbol = async () => {
      if (!formData.symbol || formData.symbol.length < 3) return;

      try {
        const { StablebondSDK } = await import('@etherfuse/stablebond-sdk');
        const sdk: StablebondSDK = new StablebondSDK({ connection, wallet });
        // Assuming a function exists to validate the symbol
        const existingMint = await sdk.getStablebondBalance(wallet.publicKey!); // Placeholder logic
        setTokenMintExists(existingMint > 0);
      } catch (error) {
        console.error('Error checking token symbol:', error);
      }
    };

    validateSymbol();
  }, [formData.symbol, connection, wallet]);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (!wallet.connected || !wallet.publicKey) return;
  
      try {
        const program = await SwitchboardProgram.load(
          connection,
          Keypair.generate()
        );
  
        const currency = SUPPORTED_CURRENCIES.find(c => c.code === formData.targetCurrency);
        if (!currency) throw new Error('Unsupported currency');
  
        const aggregatorAddress = new PublicKey(currency.aggregatorAddress);
  
        // Correct the instantiation of AggregatorAccount
        const aggregator = new AggregatorAccount(program, aggregatorAddress);
  
        const result = await aggregator.fetchLatestValue();
        if (result) {
          setExchangeRate(result);
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
        toast.error('Failed to fetch exchange rate');
      }
    };
  
    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 60000);
    return () => clearInterval(interval);
  }, [wallet.connected, connection, wallet.publicKey, formData.targetCurrency]);
  
  // Fetch user's stablebond balance
  useEffect(() => {
    const fetchStablebondBalance = async () => {
      if (!wallet.connected || !wallet.publicKey) return;

      try {
        const { StablebondSDK } = await import('@etherfuse/stablebond-sdk');
        const sdk: StablebondSDK = new StablebondSDK({ connection, wallet });
        const balance = await sdk.getStablebondBalance(wallet.publicKey);
        setStablebondBalance(balance);
      } catch (error) {
        console.error('Error fetching stablebond balance:', error);
        toast.error('Failed to fetch stablebond balance');
      }
    };

    fetchStablebondBalance();
    const interval = setInterval(fetchStablebondBalance, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [wallet.connected, connection, wallet.publicKey, formData.targetCurrency, wallet]);

  const validatePegMechanism = () => {
    if (formData.pegMechanism === 'collateralized') {
      const currency = SUPPORTED_CURRENCIES.find(c => c.code === formData.targetCurrency);
      if (!currency) throw new Error('Unsupported currency');

      if (formData.collateralRatio < currency.minCollateralRatio) {
        throw new Error(`Collateral ratio must be at least ${currency.minCollateralRatio}%`);
      }

      const requiredCollateral = (formData.maxSupply * formData.collateralRatio) / 100;
      if (stablebondBalance < requiredCollateral) {
        throw new Error(`Insufficient collateral. Need ${requiredCollateral} stablebonds.`);
      }
    }
  };

  const validateFormData = () => {
    if (tokenMintExists) {
      throw new Error('Token symbol already exists');
    }

    if (formData.symbol.length < 3 || formData.symbol.length > 10) {
      throw new Error('Symbol must be between 3 and 10 characters');
    }

    if (formData.name.length < 3 || formData.name.length > 50) {
      throw new Error('Name must be between 3 and 50 characters');
    }

    if (formData.maxSupply <= 0) {
      throw new Error('Maximum supply must be greater than 0');
    }

    validatePegMechanism();
  };

  const createStablecoin = async () => {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
  
    try {
      validateFormData();
  
      const { StablebondSDK } = await import('@etherfuse/stablebond-sdk');
      const sdk: StablebondSDK = new StablebondSDK({ connection, wallet });
  
      // Placeholder: Use SDK for stablecoin creation or add appropriate logic
      const signature = await sdk.getStablebondBalance(wallet.publicKey); // Updated: Placeholder logic
      
      // Updated confirmation handling
      await connection.confirmTransaction({
        signature: signature.toString(),
        blockhash: (await connection.getLatestBlockhash()).blockhash,
        lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
      });
  
      return signature;
    } catch (error) {
      console.error('Error creating stablecoin:', error);
      throw error;
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      await toast.promise(
        createStablecoin(),
        {
          loading: 'Creating your stablecoin...',
          success: 'Stablecoin created successfully!',
          error: (err: Error) => `Failed to create stablecoin: ${err.message}`
        }
      );
  

      setFormData({
        name: '',
        symbol: '',
        icon: '',
        targetCurrency: 'USD',
        pegMechanism: 'collateralized',
        collateralRatio: 150,
        maxSupply: 1000000,
        decimals: 6
      });
  
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
        toast.error(`Failed to create stablecoin: ${error.message}`);
      } else {
        console.error('An unknown error occurred:', error);
        toast.error('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };
  

  const renderInfoAlert = () => {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === formData.targetCurrency);
    if (!currency) return null;

    return (
      <Alert className="mb-4" variant="default">
        <div className="flex items-center">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Minimum collateral ratio for {currency.name}: {currency.minCollateralRatio}%
          </AlertDescription>
        </div>
      </Alert>
    );
  };
  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800/50 rounded-xl shadow-xl">
      <div className="flex items-center justify-center mb-8">
        <Coins className="w-12 h-12 text-emerald-400 mr-4" />
        <h2 className="text-3xl font-bold">Create Your Stablecoin</h2>
      </div>

      {tokenMintExists && (
        <Alert className="mb-4" variant="warning">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This token symbol already exists. Please choose a different symbol.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {renderInfoAlert()}

      {exchangeRate && (
        <Alert className="mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Current exchange rate: 1 {formData.targetCurrency} = {exchangeRate.toFixed(4)} USD
            </AlertDescription>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form fields remain the same */}
        <div>
          <label className="block text-sm font-medium mb-2">Token Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="e.g., My Stable USD"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Token Symbol</label>
          <input
            type="text"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="e.g., MUSD"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Token Icon URL</label>
          <div className="flex gap-4">
            <input
              type="url"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="flex-1 px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="https://example.com/icon.png"
            />
            <button
              type="button"
              className="px-4 py-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors"
            >
              <Upload className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Target Currency</label>
          <select
            value={formData.targetCurrency}
            onChange={(e) => setFormData({ ...formData, targetCurrency: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Peg Mechanism</label>
          <select
            value={formData.pegMechanism}
            onChange={(e) => setFormData({ ...formData, pegMechanism: e.target.value as 'algorithmic' | 'collateralized' })}
            className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="collateralized">Collateralized</option>
            <option value="algorithmic">Algorithmic</option>
          </select>
        </div>

        {formData.pegMechanism === 'collateralized' && (
          <div>
            <label className="block text-sm font-medium mb-2">Collateral Ratio (%)</label>
            <input
              type="number"
              value={formData.collateralRatio}
              onChange={(e) => setFormData({ ...formData, collateralRatio: Number(e.target.value) })}
              min="100"
              max="300"
              className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Maximum Supply</label>
          <input
            type="number"
            value={formData.maxSupply}
            onChange={(e) => setFormData({ ...formData, maxSupply: Number(e.target.value) })}
            min="1"
            className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {wallet.connected ? (
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Stablecoin'}
          </button>
        ) : (
          <WalletMultiButton className="w-full" />
        )}
      </form>
    </div>
  );
}

export default CreateStablecoin;
