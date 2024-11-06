import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Upload, Coins, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Transaction, SystemProgram, PublicKey, Keypair } from '@solana/web3.js';
import { AggregatorAccount, SwitchboardProgram } from '@switchboard-xyz/solana.js';

// Type declarations
type StablebondSDK = any;
type StablebondSDKOptions = {
  connection: any;
  wallet: any;
};

interface StablecoinFormData {
  name: string;
  symbol: string;
  icon: string;
  targetCurrency: string;
  pegMechanism: 'algorithmic' | 'collateralized';
  collateralRatio: number;
  maxSupply: number;
}

interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

// Simple Alert components
const Alert: React.FC<AlertProps> = ({ children, className }) => (
  <div className={`p-4 bg-blue-900/50 rounded-lg ${className}`}>
    {children}
  </div>
);

const AlertDescription: React.FC<AlertProps> = ({ children }) => (
  <div className="ml-2 text-sm">{children}</div>
);

export function CreateStablecoin() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [stablebondBalance, setStablebondBalance] = useState<number>(0);

  const [formData, setFormData] = useState<StablecoinFormData>({
    name: '',
    symbol: '',
    icon: '',
    targetCurrency: 'USD',
    pegMechanism: 'collateralized',
    collateralRatio: 150,
    maxSupply: 1000000
  });

  // Initialize Switchboard program and fetch exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (!wallet.connected || !wallet.publicKey) return;

      try {
        // Initialize Switchboard program
        const program = await SwitchboardProgram.load(
          connection,
          Keypair.generate() // Using a temporary keypair for read-only operations
        );

        // Replace with actual aggregator address for the specific currency pair
        const aggregatorPubkey = new PublicKey('YOUR_AGGREGATOR_ADDRESS');
        const aggregator = new AggregatorAccount(program, aggregatorPubkey);

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
    const interval = setInterval(fetchExchangeRate, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [wallet.connected, connection, wallet.publicKey]);

  // Fetch user's stablebond balance
  useEffect(() => {
    const fetchStablebondBalance = async () => {
      if (!wallet.connected || !wallet.publicKey) return;

      try {
        // Dynamic import with type assertion
        const stablebondModule = await import('@etherfuse/stablebond-sdk') as {
          StablebondSDK: new (options: StablebondSDKOptions) => StablebondSDK;
        };
        
        const sdk = new stablebondModule.StablebondSDK({
          connection,
          wallet
        });

        const balance = await sdk.getStablebondBalance(wallet.publicKey);
        setStablebondBalance(balance);
      } catch (error) {
        console.error('Error fetching stablebond balance:', error);
      }
    };

    fetchStablebondBalance();
  }, [wallet.connected, wallet.publicKey, connection]);

  const validatePegMechanism = () => {
    if (formData.pegMechanism === 'collateralized') {
      const requiredCollateral = (formData.maxSupply * formData.collateralRatio) / 100;
      if (stablebondBalance < requiredCollateral) {
        throw new Error(`Insufficient collateral. Need ${requiredCollateral} stablebonds.`);
      }
    }
  };

  const createStablecoin = async () => {
    if (!wallet.publicKey) throw new Error('Wallet not connected');

    try {
      // Create transaction for stablecoin creation
      const transaction = new Transaction();
      
      // Add your program instructions here
      // This is a placeholder for the actual program calls
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: new PublicKey('YOUR_PROGRAM_ADDRESS'),
          lamports: await connection.getMinimumBalanceForRentExemption(1024),
          space: 1024,
          programId: new PublicKey('YOUR_PROGRAM_ID')
        })
      );

      // Sign and send transaction
      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);

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
      validatePegMechanism();

      await toast.promise(
        createStablecoin(),
        {
          loading: 'Creating your stablecoin...',
          success: 'Stablecoin created successfully!',
          error: (err) => `Failed to create stablecoin: ${err.message}`
        }
      );

      // Reset form after successful creation
      setFormData({
        name: '',
        symbol: '',
        icon: '',
        targetCurrency: 'USD',
        pegMechanism: 'collateralized',
        collateralRatio: 150,
        maxSupply: 1000000
      });

    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800/50 rounded-xl shadow-xl">
      <div className="flex items-center justify-center mb-8">
        <Coins className="w-12 h-12 text-emerald-400 mr-4" />
        <h2 className="text-3xl font-bold">Create Your Stablecoin</h2>
      </div>

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