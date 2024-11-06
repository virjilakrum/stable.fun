import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Upload, Coins } from 'lucide-react';
import toast from 'react-hot-toast';

export function CreateStablecoin() {
  const { connected } = useWallet();
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    icon: '',
    targetCurrency: 'USD'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      toast.promise(
        // This is where we'll integrate with the Solana program
        new Promise((resolve) => setTimeout(resolve, 2000)),
        {
          loading: 'Creating your stablecoin...',
          success: 'Stablecoin created successfully!',
          error: 'Failed to create stablecoin'
        }
      );
    } catch (error) {
      console.error('Error creating stablecoin:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800/50 rounded-xl shadow-xl">
      <div className="flex items-center justify-center mb-8">
        <Coins className="w-12 h-12 text-emerald-400 mr-4" />
        <h2 className="text-3xl font-bold">Create Your Stablecoin</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {connected ? (
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 py-3 rounded-lg font-medium transition-colors"
          >
            Create Stablecoin
          </button>
        ) : (
          <WalletMultiButton className="w-full" />
        )}
      </form>
    </div>
  );
}