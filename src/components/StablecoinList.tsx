import { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface Stablecoin {
  name: string;
  symbol: string;
  icon: string;
  targetCurrency: string;
  totalSupply: number;
  creator: string;
}

export function StablecoinList() {
  const [stablecoins, setStablecoins] = useState<Stablecoin[]>([]);

  useEffect(() => {
    // This is where we'll fetch the list of created stablecoins
    const fetchStablecoins = async () => {
      // Placeholder data
      setStablecoins([
        {
          name: 'Demo Stable USD',
          symbol: 'dUSD',
          icon: 'https://example.com/icon.png',
          targetCurrency: 'USD',
          totalSupply: 1000000,
          creator: 'Demo Creator'
        }
      ]);
    };

    fetchStablecoins();
  }, []);

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold mb-8">Active Stablecoins</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stablecoins.map((coin, index) => (
          <div key={index} className="bg-slate-800/50 rounded-xl p-6 hover:transform hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img src={coin.icon} alt={coin.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h3 className="text-xl font-bold">{coin.name}</h3>
                  <p className="text-slate-400">{coin.symbol}</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Currency</span>
                <span>{coin.targetCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Supply</span>
                <span>{coin.totalSupply.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Creator</span>
                <span className="text-emerald-400">{`${coin.creator.slice(0, 6)}...${coin.creator.slice(-4)}`}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}