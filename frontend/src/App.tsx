import { useEffect, useState, useMemo } from 'react';
import { 
  Coins, 
  Wallet, 
  ArrowRightLeft, 
  Compass, 
  Bot, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Flame, 
  TrendingUp, 
  Sparkles, 
  Layers, 
  RefreshCw,
  Send,
  User,
  ShieldCheck
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

import { getGasFees, getTokenPrices, getStakingPools, queryAIAnalyst } from './services/api';

// Static / Mock Data
const portfolioHistory = [
  { day: 'Mon', value: 24200 },
  { day: 'Tue', value: 25400 },
  { day: 'Wed', value: 24800 },
  { day: 'Thu', value: 26100 },
  { day: 'Fri', value: 27900 },
  { day: 'Sat', value: 27400 },
  { day: 'Sun', value: 28650 },
];

const nftCollection = [
  { id: 1, name: 'Cyber Samurai #892', collection: 'Neo Tokyo', price: '2.45 ETH', rank: '#212', color: 'linear-gradient(135deg, #ec4899, #8b5cf6)' },
  { id: 2, name: 'Ethereal Nomad #04', collection: 'Abstract Realms', price: '0.89 ETH', rank: '#1054', color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
  { id: 3, name: 'Quantum Ape #4431', collection: 'Bored Ape Yacht Club', price: '21.50 ETH', rank: '#4431', color: 'linear-gradient(135deg, #10b981, #059669)' },
  { id: 4, name: 'Solar Flare #12', collection: 'Galactic Horizon', price: '1.75 ETH', rank: '#89', color: 'linear-gradient(135deg, #f97316, #e11d48)' },
  { id: 5, name: 'Solana Surfer #609', collection: 'Solana Monkeys', price: '12.0 SOL', rank: '#609', color: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' },
  { id: 6, name: 'Chrono Glitch #77', collection: 'Decentralized Grid', price: '0.45 ETH', rank: '#9012', color: 'linear-gradient(135deg, #6b7280, #374151)' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'swap' | 'staking' | 'nfts' | 'ai-analyst'>('dashboard');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalances, setWalletBalances] = useState({ ETH: 5.42, SOL: 34.5, LINK: 120.0, UNI: 50.0 });
  
  // API states
  const [gasInfo, setGasInfo] = useState<any>(null);
  const [prices, setPrices] = useState<any>(null);
  const [stakingPools, setStakingPools] = useState<any[]>([]);
  
  // Swap Widget states
  const [swapFrom, setSwapFrom] = useState('ETH');
  const [swapTo, setSwapTo] = useState('SOL');
  const [swapAmount, setSwapAmount] = useState('1.0');
  const [swapResult, setSwapResult] = useState<string>('');
  const [swapping, setSwapping] = useState(false);
  
  // Yield Staking states
  const [stakingPrincipal, setStakingPrincipal] = useState(1000);
  const [stakingApy, setStakingApy] = useState(4.5);
  const [stakingDays, setStakingDays] = useState(365);
  
  // AI Chat states
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'Hello! I am your Web3 AI Analyst. Ask me about gas optimization, asset allocation, staking yield strategies, or risk management!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  // Fetch Gas and Prices periodically
  useEffect(() => {
    async function loadData() {
      try {
        const [gas, priceData, pools] = await Promise.all([
          getGasFees(),
          getTokenPrices(),
          getStakingPools()
        ]);
        setGasInfo(gas);
        setPrices(priceData);
        setStakingPools(pools);
      } catch (err) {
        console.error('Error fetching Web3 live feeds:', err);
      }
    }
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const connectWallet = () => {
    if (walletConnected) {
      setWalletConnected(false);
      setWalletAddress('');
    } else {
      setWalletConnected(true);
      setWalletAddress('0x71C...39b9');
    }
  };

  // Live total balance calculation
  const totalBalanceUSD = useMemo(() => {
    if (!prices) return 25420.50;
    const ethVal = walletBalances.ETH * (prices.ETH?.price || 3245);
    const solVal = walletBalances.SOL * (prices.SOL?.price || 142);
    const linkVal = walletBalances.LINK * (prices.LINK?.price || 15.7);
    const uniVal = walletBalances.UNI * (prices.UNI?.price || 7.9);
    return Math.round((ethVal + solVal + linkVal + uniVal) * 100) / 100;
  }, [prices, walletBalances]);

  // Execute Swap
  const handleSwap = () => {
    if (!prices || swapping) return;
    setSwapping(true);
    setSwapResult('Swapping on DEX Aggregator...');
    setTimeout(() => {
      const fromAmount = parseFloat(swapAmount);
      if (isNaN(fromAmount) || fromAmount <= 0) {
        setSwapResult('Invalid amount');
        setSwapping(false);
        return;
      }
      
      const fromPrice = prices[swapFrom]?.price || 1;
      const toPrice = prices[swapTo]?.price || 1;
      const toAmount = (fromAmount * fromPrice) / toPrice;
      
      setWalletBalances(prev => {
        const next = { ...prev };
        // Deduct from, add to
        if (swapFrom in next) next[swapFrom as keyof typeof next] -= fromAmount;
        if (swapTo in next) next[swapTo as keyof typeof next] += toAmount;
        return next;
      });

      setSwapResult(`Successfully swapped ${fromAmount} ${swapFrom} for ${toAmount.toFixed(4)} ${swapTo}!`);
      setSwapping(false);
    }, 1500);
  };

  // Compounding Yield Estimate
  const estimatedYield = useMemo(() => {
    const rate = stakingApy / 100;
    const time = stakingDays / 365;
    const compound = stakingPrincipal * Math.pow(1 + rate / 365, 365 * time);
    return Math.round((compound - stakingPrincipal) * 100) / 100;
  }, [stakingPrincipal, stakingApy, stakingDays]);

  // Submit Chat Message to AI Analyst
  const sendChatMessage = async (msgText = chatInput) => {
    if (!msgText.trim()) return;
    
    setChatMessages(prev => [...prev, { sender: 'user', text: msgText }]);
    setChatInput('');
    setAiTyping(true);

    try {
      const response = await queryAIAnalyst(msgText, {
        total_balance: totalBalanceUSD,
        balances: walletBalances,
        gas: gasInfo
      });
      setChatMessages(prev => [...prev, { sender: 'bot', text: response.reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I'm experiencing connectivity issues to my analytical nodes. Please try again shortly." }]);
    } finally {
      setAiTyping(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <Coins size={32} className="logo-icon" />
          <span className="logo-text">AETHER.FI</span>
        </div>

        <nav>
          <ul className="nav-links">
            <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <Compass size={20} className="nav-icon" /> Dashboard
            </li>
            <li className={`nav-item ${activeTab === 'swap' ? 'active' : ''}`} onClick={() => setActiveTab('swap')}>
              <ArrowRightLeft size={20} className="nav-icon" /> Swap DEX
            </li>
            <li className={`nav-item ${activeTab === 'staking' ? 'active' : ''}`} onClick={() => setActiveTab('staking')}>
              <Layers size={20} className="nav-icon" /> Staking & Yield
            </li>
            <li className={`nav-item ${activeTab === 'nfts' ? 'active' : ''}`} onClick={() => setActiveTab('nfts')}>
              <Sparkles size={20} className="nav-icon" /> NFT Gallery
            </li>
            <li className={`nav-item ${activeTab === 'ai-analyst' ? 'active' : ''}`} onClick={() => setActiveTab('ai-analyst')}>
              <Bot size={20} className="nav-icon" /> AI Wallet Analyst
            </li>
          </ul>
        </nav>

        {/* Live System stats */}
        {gasInfo && (
          <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border-glow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Live Gas (ETH)</span>
              <Flame size={16} style={{ color: '#f97316' }} />
            </div>
            <strong style={{ fontSize: '1.25rem' }}>{gasInfo.standard} {gasInfo.unit}</strong>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-green)', marginTop: '0.25rem' }}>
              Congestion: {gasInfo.congestion}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="page-title">
            <h1>
              {activeTab === 'dashboard' && 'Web3 Hub & Portfolio'}
              {activeTab === 'swap' && 'Instant Swap DEX'}
              {activeTab === 'staking' && 'DeFi Staking Yard'}
              {activeTab === 'nfts' && 'NFT Collectibles'}
              {activeTab === 'ai-analyst' && 'AI Portfolio Analyst'}
            </h1>
            <p>
              {activeTab === 'dashboard' && 'Analytics, price feeds, and smart wallet views.'}
              {activeTab === 'swap' && 'Trade assets instantly with decentralized slippage control.'}
              {activeTab === 'staking' && 'Compound your digital assets with optimized validator pools.'}
              {activeTab === 'nfts' && 'Your visual digital art portfolio assets.'}
              {activeTab === 'ai-analyst' && 'Direct conversational interface to your digital advisor.'}
            </p>
          </div>

          <div className="header-actions">
            <button className={walletConnected ? 'btn-connected' : 'btn-connect'} onClick={connectWallet}>
              <Wallet size={18} />
              {walletConnected ? walletAddress : 'Connect Wallet'}
            </button>
          </div>
        </header>

        {/* Dashboard / Home tab */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Top Metric Cards */}
            <div className="grid-stats">
              <div className="stat-card">
                <div className="stat-header">
                  Net Worth <Activity size={18} className="stat-icon" />
                </div>
                <div className="stat-value">${totalBalanceUSD.toLocaleString()}</div>
                <div className="stat-desc">
                  <TrendingUp size={12} /> +4.8% (24h)
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  Liquid Assets <Coins size={18} className="stat-icon" />
                </div>
                <div className="stat-value">4 Tokens</div>
                <div className="stat-desc">Multi-chain connected</div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  Gas Index <Flame size={18} className="stat-icon" />
                </div>
                <div className="stat-value">{gasInfo ? `${gasInfo.standard} Gwei` : '--'}</div>
                <div className={`stat-desc ${gasInfo?.congestion === 'High' ? 'negative' : ''}`}>
                  {gasInfo ? `${gasInfo.congestion} traffic` : 'Loading...'}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  Shield Protection <ShieldCheck size={18} className="stat-icon" />
                </div>
                <div className="stat-value" style={{ color: 'var(--accent-green)' }}>Active</div>
                <div className="stat-desc">No vulnerable approvals</div>
              </div>
            </div>

            {/* Dashboard Visual Grid */}
            <div className="dashboard-grid">
              {/* Chart */}
              <div className="chart-card">
                <div className="card-title">
                  <span>Balance History</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 400 }}>7 Days</span>
                </div>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={portfolioHistory}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="var(--text-dimmed)" />
                      <YAxis stroke="var(--text-dimmed)" domain={['dataMin - 1000', 'dataMax + 1000']} />
                      <Tooltip 
                        contentStyle={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-glow)', borderRadius: '12px' }} 
                        labelStyle={{ color: 'white' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Live Token list */}
              <div className="chart-card">
                <div className="card-title">
                  <span>Live Balances</span>
                  <RefreshCw size={16} className="stat-icon" />
                </div>
                <div>
                  {[
                    { sym: 'ETH', name: 'Ethereum', bal: walletBalances.ETH, color: '#627EEA' },
                    { sym: 'SOL', name: 'Solana', bal: walletBalances.SOL, color: '#14F195' },
                    { sym: 'LINK', name: 'Chainlink', bal: walletBalances.LINK, color: '#375BD2' },
                    { sym: 'UNI', name: 'Uniswap', bal: walletBalances.UNI, color: '#FF007A' },
                  ].map((token) => {
                    const priceInfo = prices ? prices[token.sym] : null;
                    const usdValue = priceInfo ? (token.bal * priceInfo.price) : (token.bal * 100);
                    return (
                      <div className="token-row" key={token.sym}>
                        <div className="token-info">
                          <div className="token-avatar" style={{ borderLeft: `3px solid ${token.color}` }}>
                            {token.sym}
                          </div>
                          <div>
                            <div className="token-name">{token.name}</div>
                            <div className="token-sym">{token.bal} {token.sym}</div>
                          </div>
                        </div>
                        <div className="token-values">
                          <div className="token-price">${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          {priceInfo && (
                            <div className={`token-change ${priceInfo.change_24h >= 0 ? 'positive' : 'negative'}`}>
                              {priceInfo.change_24h >= 0 ? '+' : ''}{priceInfo.change_24h}%
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Swap DEX Tab */}
        {activeTab === 'swap' && (
          <div className="swap-container">
            <div className="card-title">
              <span>Swap Assets</span>
              <SettingsConfigIcon />
            </div>

            {/* Input From */}
            <div className="swap-input-group">
              <div className="input-label">
                <span>From</span>
                <span>Balance: {walletBalances[swapFrom as keyof typeof walletBalances] || 0}</span>
              </div>
              <div className="input-row">
                <input 
                  type="number" 
                  className="swap-input" 
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)} 
                />
                <select className="token-select" value={swapFrom} onChange={(e) => setSwapFrom(e.target.value)}>
                  <option value="ETH">ETH</option>
                  <option value="SOL">SOL</option>
                  <option value="LINK">LINK</option>
                  <option value="UNI">UNI</option>
                </select>
              </div>
            </div>

            {/* Middle arrow indicator */}
            <div className="divider-swap">
              <button className="btn-arrow-swap" onClick={() => {
                const temp = swapFrom;
                setSwapFrom(swapTo);
                setSwapTo(temp);
              }}>
                <ArrowRightLeft size={16} />
              </button>
            </div>

            {/* Input To */}
            <div className="swap-input-group">
              <div className="input-label">
                <span>To (Estimated)</span>
                <span>Balance: {walletBalances[swapTo as keyof typeof walletBalances] || 0}</span>
              </div>
              <div className="input-row">
                <input 
                  type="text" 
                  className="swap-input" 
                  disabled 
                  value={
                    prices && prices[swapFrom] && prices[swapTo] 
                      ? ((parseFloat(swapAmount) * prices[swapFrom].price) / prices[swapTo].price).toFixed(4)
                      : '0.00'
                  }
                />
                <select className="token-select" value={swapTo} onChange={(e) => setSwapTo(e.target.value)}>
                  <option value="ETH">ETH</option>
                  <option value="SOL">SOL</option>
                  <option value="LINK">LINK</option>
                  <option value="UNI">UNI</option>
                </select>
              </div>
            </div>

            {/* Swap pricing details */}
            {prices && (
              <div className="swap-details">
                <div className="detail-row">
                  <span>Rate</span>
                  <span>1 {swapFrom} = {((prices[swapFrom]?.price || 1) / (prices[swapTo]?.price || 1)).toFixed(4)} {swapTo}</span>
                </div>
                <div className="detail-row">
                  <span>Slippage Tolerance</span>
                  <span>0.5%</span>
                </div>
                <div className="detail-row">
                  <span>Network Fee</span>
                  <span>~ ${gasInfo ? (gasInfo.standard * 0.15).toFixed(2) : '1.50'}</span>
                </div>
              </div>
            )}

            <button className="btn-swap-execute" onClick={handleSwap} disabled={swapping}>
              {swapping ? 'Executing Swapping...' : 'Swap Assets'}
            </button>

            {swapResult && (
              <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border-glow)', background: 'rgba(255,255,255,0.02)', textAlign: 'center', fontSize: '0.9rem' }}>
                {swapResult}
              </div>
            )}
          </div>
        )}

        {/* Staking & APY calculator Tab */}
        {activeTab === 'staking' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="yield-container">
              <div className="calc-section">
                <div className="card-title">Yield Optimizer Playground</div>
                
                <div className="slider-group">
                  <div className="slider-header">
                    <span>Principal Investment</span>
                    <span className="slider-val">${stakingPrincipal.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="100" 
                    max="100000" 
                    step="500"
                    className="calc-input-slider" 
                    value={stakingPrincipal}
                    onChange={(e) => setStakingPrincipal(parseInt(e.target.value))}
                  />
                </div>

                <div className="slider-group">
                  <div className="slider-header">
                    <span>Staking Pool APY</span>
                    <span className="slider-val">{stakingApy}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="40" 
                    step="0.1"
                    className="calc-input-slider" 
                    value={stakingApy}
                    onChange={(e) => setStakingApy(parseFloat(e.target.value))}
                  />
                </div>

                <div className="slider-group">
                  <div className="slider-header">
                    <span>Duration</span>
                    <span className="slider-val">{stakingDays} Days</span>
                  </div>
                  <input 
                    type="range" 
                    min="30" 
                    max="1095" 
                    step="30"
                    className="calc-input-slider" 
                    value={stakingDays}
                    onChange={(e) => setStakingDays(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="yield-results">
                <div className="result-metric">
                  <div className="result-label">ESTIMATED REWARDS (COMPREHENSIVELY COMPOUNDED DAILY)</div>
                  <div className="result-val">${estimatedYield.toLocaleString()}</div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>Total Payout</div>
                    <strong style={{ fontSize: '1.2rem', color: 'white', marginTop: '0.25rem', display: 'block' }}>
                      ${(stakingPrincipal + estimatedYield).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>Yield Factor</div>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--accent-green)', marginTop: '0.25rem', display: 'block' }}>
                      +{((estimatedYield / stakingPrincipal) * 100).toFixed(2)}%
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Pools Grid */}
            <div className="chart-card">
              <div className="card-title">Available DeFi Staking Pools</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
                {stakingPools.map((pool) => (
                  <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-glow)' }} key={pool.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{pool.token}</strong>
                      <span style={{ fontSize: '0.75rem', background: pool.risk === 'Low' ? 'rgba(16,185,129,0.1)' : 'rgba(249,115,22,0.1)', color: pool.risk === 'Low' ? 'var(--accent-green)' : '#f97316', padding: '0.25rem 0.5rem', borderRadius: '6px', fontWeight: 600 }}>
                        {pool.risk} Risk
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Platform: {pool.platform}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>APY</div>
                        <strong style={{ fontSize: '1.2rem', color: 'var(--accent-green)' }}>{pool.apy}%</strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TVL</div>
                        <strong style={{ fontSize: '1.1rem', color: 'white' }}>{pool.tvl}</strong>
                      </div>
                    </div>
                    <button 
                      style={{ width: '100%', marginTop: '1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-glow)', color: 'white', padding: '0.5rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => {
                        setStakingApy(pool.apy);
                        setStakingPrincipal(5000);
                      }}
                    >
                      Use APY
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NFT Gallery Tab */}
        {activeTab === 'nfts' && (
          <div className="nft-grid">
            {nftCollection.map((nft) => (
              <div className="nft-card" key={nft.id}>
                <div className="nft-image-container">
                  <div style={{ width: '100%', height: '100%', background: nft.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Sparkles size={60} style={{ opacity: 0.3 }} />
                  </div>
                  <div className="nft-badge">{nft.rank}</div>
                </div>
                <div className="nft-info">
                  <div className="nft-title">{nft.name}</div>
                  <div className="nft-creator">{nft.collection}</div>
                  <div className="nft-price-row">
                    <div>
                      <span className="nft-price-label">Price</span>
                      <div className="nft-price-val">{nft.price}</div>
                    </div>
                    <button style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-glow)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Portfolio Analyst Chat Tab */}
        {activeTab === 'ai-analyst' && (
          <div className="chat-container">
            <header className="chat-header">
              <div className="chat-header-status" />
              <div className="chat-header-title">Aether Portfolio Oracle</div>
            </header>

            <div className="chat-messages">
              {chatMessages.map((msg, i) => (
                <div className={`chat-bubble ${msg.sender}`} key={i}>
                  {msg.text}
                </div>
              ))}
              {aiTyping && (
                <div className="chat-bubble bot" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '0.75rem 1rem' }}>
                  <span style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1s infinite alternate' }} />
                  <span style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1s infinite alternate 0.2s' }} />
                  <span style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1s infinite alternate 0.4s' }} />
                </div>
              )}
            </div>

            {/* Quick Action Suggestion pills */}
            <div className="chat-suggestions">
              {[
                "Analyze my asset allocation",
                "Staking yield suggestions",
                "Optimize my gas fees",
                "What is Jito SOL staking?"
              ].map((suggestion, i) => (
                <div 
                  className="suggestion-pill" 
                  key={i} 
                  onClick={() => sendChatMessage(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>

            {/* Text Input area */}
            <form 
              className="chat-input-bar" 
              onSubmit={(e) => {
                e.preventDefault();
                sendChatMessage();
              }}
            >
              <input 
                type="text" 
                className="chat-input" 
                placeholder="Ask about gas fees, risk models, allocations..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="btn-chat-send">
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

// Simple placeholder UI assets
function SettingsConfigIcon() {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      <span style={{ width: '4px', height: '4px', background: 'var(--text-secondary)', borderRadius: '50%' }} />
      <span style={{ width: '4px', height: '4px', background: 'var(--text-secondary)', borderRadius: '50%' }} />
      <span style={{ width: '4px', height: '4px', background: 'var(--text-secondary)', borderRadius: '50%' }} />
    </div>
  );
}
