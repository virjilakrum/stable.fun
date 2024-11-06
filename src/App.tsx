import React from 'react';
import { Toaster } from 'react-hot-toast';
import { WalletContextProvider } from './components/WalletContextProvider';
import { CreateStablecoin } from './components/CreateStablecoin';
import { StablecoinList } from './components/StablecoinList';
import { Coins, Lock, ArrowRight, TrendingUp, Shield } from 'lucide-react';

function App() {
  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <Toaster position="top-right" />
        
        {/* Hero Section */}
        <header className="container mx-auto px-4 py-16 md:py-24">
          <nav className="flex justify-between items-center mb-16">
            <div className="flex items-center space-x-2">
              <Coins className="w-8 h-8 text-emerald-400" />
              <span className="text-2xl font-bold">stable.fun</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
              <a href="#create" className="hover:text-emerald-400 transition-colors">Create</a>
              <a href="#explore" className="hover:text-emerald-400 transition-colors">Explore</a>
            </div>
          </nav>

          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-500 text-transparent bg-clip-text">
              Create Your Own Yield-Bearing Stablecoins
            </h1>
            <p className="text-xl text-slate-300 mb-12">
              Launch custom stablecoins backed by government bonds on Solana. Earn yield while maintaining stability.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <a 
                href="#create"
                className="bg-emerald-500 hover:bg-emerald-600 px-8 py-4 rounded-lg font-medium text-lg transition-colors flex items-center justify-center"
              >
                Start Creating <ArrowRight className="ml-2 w-5 h-5" />
              </a>
              <a
                href="#features"
                className="bg-slate-700 hover:bg-slate-600 px-8 py-4 rounded-lg font-medium text-lg transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section id="features" className="py-20 bg-slate-800/50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">Why Choose stable.fun?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Lock className="w-12 h-12 text-emerald-400" />,
                  title: "Secure Backing",
                  description: "Every stablecoin is backed by government bonds through Etherfuse's Stablebonds"
                },
                {
                  icon: <TrendingUp className="w-12 h-12 text-emerald-400" />,
                  title: "Earn Yield",
                  description: "Generate passive income from your stablecoin's underlying bond yields"
                },
                {
                  icon: <Shield className="w-12 h-12 text-emerald-400" />,
                  title: "Stable Value",
                  description: "Maintain price stability with battle-tested bond backing mechanisms"
                }
              ].map((feature, index) => (
                <div key={index} className="bg-slate-700/50 p-8 rounded-xl hover:transform hover:-translate-y-1 transition-all">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Create Section */}
        <section id="create" className="py-20">
          <CreateStablecoin />
        </section>

        {/* Explore Section */}
        <section id="explore" className="py-20 bg-slate-800/50">
          <StablecoinList />
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Coins className="w-6 h-6 text-emerald-400" />
                <span className="text-xl font-bold">stable.fun</span>
              </div>
              <div className="flex space-x-8">
                <a href="https://docs.etherfuse.com" className="text-slate-400 hover:text-white transition-colors">Docs</a>
                <a href="https://twitter.com/etherfuse" className="text-slate-400 hover:text-white transition-colors">Twitter</a>
                <a href="https://etherfuse.com" className="text-slate-400 hover:text-white transition-colors">Etherfuse</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </WalletContextProvider>
  );
}

export default App;
