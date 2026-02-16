
import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ComposedChart, Line, Bar 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Target, 
  Activity, Calendar, Clock, ChevronRight,
  Terminal as TerminalIcon, BarChart3, Zap, 
  Wifi, ShieldCheck, Search
} from 'lucide-react';
import { EAConfig, PricePoint, Trade, TerminalLog, MarketData } from '../types';

const generateMockData = (symbol: string): PricePoint[] => {
  const data: PricePoint[] = [];
  const isVolIndex = symbol.startsWith('Vol');
  let currentPrice = isVolIndex ? 450000.00 : 2030.50;
  let baseUpper = currentPrice + (isVolIndex ? 5000 : 15);
  let baseLower = currentPrice - (isVolIndex ? 5000 : 15);

  for (let i = 0; i < 40; i++) {
    const time = `${i + 9}:00`;
    const volatilityFactor = isVolIndex ? 800 : 4;
    const volatility = (Math.random() - 0.5) * volatilityFactor;
    currentPrice += volatility;
    const trend = i * (isVolIndex ? 50 : 0.2);
    const upper = baseUpper + trend + (Math.random() * (isVolIndex ? 200 : 2));
    const lower = baseLower + trend - (Math.random() * (isVolIndex ? 200 : 2));
    const middle = (upper + lower) / 2;

    const noise = Math.random() * (isVolIndex ? 100 : 2);
    const open = currentPrice - noise;
    const close = currentPrice + noise;
    const high = Math.max(open, close) + noise;
    const low = Math.min(open, close) - noise;

    data.push({
      time, open, high, low, close,
      upperChannel: upper, middleChannel: middle, lowerChannel: lower,
      signal: i === 15 ? 'buy' : i === 30 ? 'sell' : undefined
    });
  }
  return data;
};

const initialLogs: TerminalLog[] = [
  { id: '1', time: '09:00:01', type: 'INFO', message: 'FlowShift MT5 EA version 1.0.0 initialized' },
  { id: '2', time: '09:00:02', type: 'INFO', message: 'Loading custom indicator: NB_SHI_Channel_true...' },
  { id: '3', time: '09:00:05', type: 'INFO', message: 'Deriv Bridge active: Streaming Synthetic Indices' },
  { id: '4', time: '10:45:12', type: 'TRADE', message: 'New Signal: Buy Limit @ 2024.50' },
  { id: '5', time: '10:45:15', type: 'TRADE', message: 'Order #12345678 placed successfully' },
];

const initialMarket: MarketData[] = [
  { symbol: 'Vol 75 (1s)', bid: 452140.25, ask: 452142.10, change: 2.45, direction: 'up' },
  { symbol: 'Vol 100', bid: 12450.80, ask: 12451.20, change: -1.15, direction: 'down' },
  { symbol: 'Vol 10 (1s)', bid: 6842.15, ask: 6842.30, change: 0.35, direction: 'up' },
  { symbol: 'Vol 50 (1s)', bid: 245120.40, ask: 245123.00, change: -0.85, direction: 'down' },
  { symbol: 'XAUUSD', bid: 2035.40, ask: 2035.52, change: 1.25, direction: 'up' },
  { symbol: 'BTCUSD', bid: 64140, ask: 64155, change: 2.40, direction: 'up' },
  { symbol: 'EURUSD', bid: 1.0845, ask: 1.0846, change: -0.12, direction: 'down' },
];

const Dashboard: React.FC<{ config: EAConfig }> = ({ config }) => {
  const chartData = useMemo(() => generateMockData(config.symbol), [config.symbol]);
  const [logs, setLogs] = useState<TerminalLog[]>(initialLogs);
  const [market, setMarket] = useState<MarketData[]>(initialMarket);

  // Simulate real-time price changes for synthetic and forex pairs
  useEffect(() => {
    const interval = setInterval(() => {
      setMarket(prev => prev.map(m => {
        const isVol = m.symbol.startsWith('Vol');
        const isBTC = m.symbol.includes('BTC');
        const volStep = isVol ? (m.bid * 0.0005) : isBTC ? 10 : 0.0002;
        const move = (Math.random() - 0.5) * volStep;
        const newBid = m.bid + move;
        const spread = isVol ? (m.bid * 0.00005) : (m.bid * 0.0001);
        return {
          ...m,
          bid: newBid,
          ask: newBid + spread,
          direction: move > 0 ? 'up' : 'down'
        };
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mockTrades: Trade[] = [
    { id: '1', type: 'BUY', entry: 452000.50, sl: 451000.00, tp: 454500.00, volume: 0.1, time: '10:45', status: 'CLOSED', profit: 450.20 },
    { id: '2', type: 'SELL', entry: 453142.10, sl: 454000.00, tp: 451000.00, volume: 0.1, time: '14:20', status: 'OPEN', profit: 120.40 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Account Balance" value="$12,450.80" trend="+2.4%" positive={true} icon={<DollarSign className="w-5 h-5" />} />
        <StatCard title="Daily Profit" value="$370.60" trend="+12%" positive={true} icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard title="Synthetic Index RR" value="1:3.2" trend="Optimal" positive={true} icon={<Target className="w-5 h-5" />} />
        <StatCard title="Execution Delay" value="8ms" trend="Stable" positive={true} icon={<Zap className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Market Watch */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[550px] overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BarChart3 className="w-3 h-3 text-indigo-500" /> Deriv Indices
              </h3>
              <Search className="w-3 h-3 text-slate-600 cursor-pointer" />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
              {market.map((m) => (
                <div key={m.symbol} className="flex items-center justify-between p-2.5 hover:bg-slate-800/80 rounded-xl transition-all group cursor-pointer border border-transparent hover:border-slate-700">
                  <div className="flex flex-col">
                    <div className="font-black text-[11px] text-slate-200 group-hover:text-indigo-400 transition-colors uppercase tracking-tighter">{m.symbol}</div>
                    <div className="text-[9px] text-slate-500 font-bold">SPREAD: {(m.ask - m.bid).toFixed(m.symbol.startsWith('Vol') ? 2 : 5)}</div>
                  </div>
                  <div className={`text-[12px] font-mono font-bold transition-all duration-300 ${m.direction === 'up' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.3)]'}`}>
                    {m.bid.toFixed(m.symbol.includes('BTC') ? 0 : m.symbol.includes('EUR') ? 5 : 2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Network Node</h3>
            <div className="space-y-3">
              <StatusItem icon={<Wifi className="w-3 h-3 text-emerald-500" />} label="Deriv-Server-02" value="Connected" />
              <StatusItem icon={<ShieldCheck className="w-3 h-3 text-indigo-500" />} label="Execution Mode" value="Direct" />
            </div>
          </div>
        </div>

        {/* Middle: Chart & Terminal */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group/chart">
            {/* Symbol Identifier Overlay */}
            <div className="absolute top-6 right-6 z-10">
              <div className="px-3 py-1 bg-slate-950/80 backdrop-blur rounded-lg border border-slate-800 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-white uppercase">{config.symbol}</span>
              </div>
            </div>

            {/* Quick Trade Panel */}
            <div className="absolute top-6 left-6 z-10 flex gap-1 p-1 bg-slate-900/80 backdrop-blur rounded-lg border border-slate-700">
              <button className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black rounded border border-rose-500/30 transition-all uppercase shadow-lg shadow-rose-900/20">Sell</button>
              <div className="px-3 py-1.5 text-[10px] font-mono text-slate-200 flex items-center bg-slate-800 rounded mx-0.5">0.10</div>
              <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded border border-indigo-500/30 transition-all uppercase shadow-lg shadow-indigo-900/20">Buy</button>
            </div>

            <div className="h-[380px] mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={9} domain={['auto', 'auto']} tickLine={false} axisLine={false} tickFormatter={(v) => v.toLocaleString()} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} 
                    labelStyle={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '12px', color: '#f8fafc' }}
                  />
                  <Area type="monotone" dataKey="upperChannel" stroke="transparent" fill="#6366f1" fillOpacity={0.03} />
                  <Area type="monotone" dataKey="lowerChannel" stroke="transparent" fill="#6366f1" fillOpacity={0.03} />
                  <Line type="monotone" dataKey="upperChannel" stroke="#4f46e5" strokeWidth={1} dot={false} strokeDasharray="4 4" opacity={0.4} />
                  <Line type="monotone" dataKey="lowerChannel" stroke="#4f46e5" strokeWidth={1} dot={false} strokeDasharray="4 4" opacity={0.4} />
                  <Line type="stepAfter" dataKey="close" stroke="#f8fafc" strokeWidth={2} dot={false} animationDuration={300} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MT5 Terminal Style Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-56 overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <TerminalIcon className="w-3 h-3" /> System Journal
              </div>
              <div className="flex gap-4 text-[9px] text-slate-600 font-mono">
                <span>LATENCY: 12ms</span>
                <span>SYNC: OK</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-1 bg-[#050505] scrollbar-thin scrollbar-thumb-slate-800">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-3 group/log border-l-2 border-transparent hover:border-indigo-500/50 hover:bg-slate-800/10 px-2 transition-all">
                  <span className="text-slate-600 shrink-0 tabular-nums">{log.time}</span>
                  <span className={`shrink-0 font-bold ${
                    log.type === 'TRADE' ? 'text-indigo-400' : 
                    log.type === 'ERROR' ? 'text-rose-400' : 
                    log.type === 'WARN' ? 'text-amber-400' : 'text-slate-500'
                  }`}>[{log.type}]</span>
                  <span className="text-slate-400 group-hover/log:text-slate-200 transition-colors">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: History & Quick Stats */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Order Book</h3>
            <div className="space-y-2 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {mockTrades.map(trade => (
                <div key={trade.id} className="p-3 bg-slate-800/30 rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${trade.type === 'BUY' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'bg-rose-600/10 text-rose-500 border border-rose-500/20'}`}>
                      {trade.type}
                    </span>
                    <span className={`text-xs font-mono font-black ${trade.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-200 font-bold mb-1">{config.symbol} @ {trade.entry.toLocaleString()}</div>
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                    <span>{trade.time}</span>
                    <span className="group-hover:text-indigo-400 transition-colors">TICKET: {trade.id}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-center gap-2 w-full text-[10px] font-black text-slate-500 hover:text-white uppercase transition-colors tracking-widest">
              Show Detailed Reports <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; trend: string; positive: boolean; icon: React.ReactNode }> = ({ 
  title, value, trend, positive, icon 
}) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all group relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
      {/* Fix: cast icon to ReactElement<any> to fix className prop error and ensure valid element */}
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-16 h-16' }) : icon}
    </div>
    <div className="flex items-start justify-between mb-3">
      <div className="p-2.5 bg-slate-800 rounded-xl text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg shadow-indigo-950/20">
        {icon}
      </div>
      <div className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
        {trend}
      </div>
    </div>
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
    <h4 className="text-xl font-black text-white">{value}</h4>
  </div>
);

const StatusItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-800/50 hover:bg-slate-800/50 transition-all">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{label}</span>
    </div>
    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">{value}</span>
  </div>
);

export default Dashboard;
