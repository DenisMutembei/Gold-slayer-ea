
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Code2, 
  Settings, 
  Bot, 
  Activity, 
  TrendingUp,
  Cpu,
  Unlink,
  Link2
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import MQLCodeViewer from './components/MQLCodeViewer';
import AIExpert from './components/AIExpert';
import { EAConfig } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'code' | 'ai' | 'settings'>('dashboard');
  const [isConnected, setIsConnected] = useState(true);
  const [config, setConfig] = useState<EAConfig>({
    riskPercent: 1.0,
    magicNumber: 777,
    slippage: 10,
    symbol: 'Vol 75 (1s)',
    timeframe: 'H1'
  });

  const MQL5_CODE = `//+------------------------------------------------------------------+
//|                       FlowShift_MT5                              |
//|   Price Action + SHI Channel Swing Expert Advisor                |
//|   Optimized for Deriv Synthetic Volatility Indices               |
//+------------------------------------------------------------------+
#property strict
#include <Trade/Trade.mqh>
CTrade trade;

input double RiskPercent = 1.0;
input int    MagicNumber = 777;
input int    Slippage    = 10;

int shiHandle;

int OnInit() {
   // Loading custom SHI Channel optimized for high volatility indices
   shiHandle = iCustom(_Symbol, _Period, "NB_SHI_Channel_true");
   return (shiHandle == INVALID_HANDLE) ? INIT_FAILED : INIT_SUCCEEDED;
}

void OnTick() {
   static datetime lastBar = 0;
   if(iTime(_Symbol, _Period, 0) == lastBar) return;
   lastBar = iTime(_Symbol, _Period, 0);

   if(PositionSelect(_Symbol)) {
      ManageTrailing();
      return;
   }

   double upper[], lower[], middle[];
   CopyBuffer(shiHandle, 1, 1, 2, upper);
   CopyBuffer(shiHandle, 2, 1, 2, lower);
   
   double close1 = iClose(_Symbol, _Period, 1);
   bool buySignal = close1 > iHigh(_Symbol, _Period, 2) && close1 < upper[0];
   bool sellSignal = close1 < iLow(_Symbol, _Period, 2) && close1 > lower[0];

   if(buySignal) trade.Buy(0.1, _Symbol, SymbolInfoDouble(_Symbol, SYMBOL_ASK), iLow(_Symbol, _Period, 1), 0);
   if(sellSignal) trade.Sell(0.1, _Symbol, SymbolInfoDouble(_Symbol, SYMBOL_BID), iHigh(_Symbol, _Period, 1), 0);
}`;

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-16 lg:w-64 bg-slate-950 border-r border-slate-900 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="hidden lg:block font-black text-lg tracking-tighter text-white uppercase italic">FlowShift</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <SidebarItem icon={<LayoutDashboard className="w-5 h-5" />} label="Terminal" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<Code2 className="w-5 h-5" />} label="Source Code" active={activeTab === 'code'} onClick={() => setActiveTab('code')} />
          <SidebarItem icon={<Bot className="w-5 h-5" />} label="Strategy AI" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
          <SidebarItem icon={<Settings className="w-5 h-5" />} label="EA Config" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 hidden lg:block">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase">Deriv Engine</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Latency</span>
              <span className="text-[10px] font-mono text-emerald-400">8ms</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-14 bg-slate-950/80 border-b border-slate-900 flex items-center justify-between px-8 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]`}></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isConnected ? 'MT5 Connected' : 'Disconnected'}</span>
            </div>
            <div className="h-4 w-px bg-slate-800"></div>
            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">
              {config.symbol} <span className="text-slate-600 mx-1">•</span> {config.timeframe}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsConnected(!isConnected)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-sm ${
                isConnected ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20' : 'bg-indigo-600 text-white shadow-indigo-600/20'
              }`}
            >
              {isConnected ? <Unlink className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
              {isConnected ? 'Kill Connection' : 'Establish Bridge'}
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-[#020617]">
          {activeTab === 'dashboard' && <Dashboard config={config} />}
          {activeTab === 'code' && <MQLCodeViewer code={MQL5_CODE} />}
          {activeTab === 'ai' && <AIExpert code={MQL5_CODE} />}
          {activeTab === 'settings' && <SettingsPanel config={config} setConfig={setConfig} />}
        </div>
      </main>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
      active ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-200'
    }`}
  >
    <span className={`${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-200'}`}>
      {icon}
    </span>
    <span className="hidden lg:block text-[11px] font-black uppercase tracking-widest">{label}</span>
    {active && <div className="ml-auto w-1 h-5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>}
  </button>
);

const SettingsPanel: React.FC<{ config: EAConfig; setConfig: (c: EAConfig) => void }> = ({ config, setConfig }) => (
  <div className="max-w-xl mx-auto bg-slate-900/50 border border-slate-800 rounded-3xl p-10 space-y-8 backdrop-blur-sm">
    <div className="text-center">
      <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Algorithm Logic</h3>
      <p className="text-slate-500 text-[10px] mt-2 uppercase font-bold tracking-[0.2em]">Deriv Synthetic Index Optimization</p>
    </div>

    <div className="grid grid-cols-1 gap-6">
      <ConfigField label="Global Risk Allocation (%)">
        <input type="number" step="0.1" value={config.riskPercent} onChange={(e) => setConfig({...config, riskPercent: Number(e.target.value)})} className="input-field" />
      </ConfigField>
      <ConfigField label="EA Magic Hash">
        <input type="number" value={config.magicNumber} onChange={(e) => setConfig({...config, magicNumber: Number(e.target.value)})} className="input-field" />
      </ConfigField>
      <ConfigField label="Deriv Asset Selection">
        <select value={config.symbol} onChange={(e) => setConfig({...config, symbol: e.target.value})} className="input-field">
          <optgroup label="Synthetic Indices" className="bg-slate-900">
            <option>Vol 10 (1s)</option>
            <option>Vol 25 (1s)</option>
            <option>Vol 50 (1s)</option>
            <option>Vol 75 (1s)</option>
            <option>Vol 100 (1s)</option>
          </optgroup>
          <optgroup label="Metals & FX" className="bg-slate-900">
            <option>XAUUSD</option>
            <option>EURUSD</option>
            <option>GBPUSD</option>
            <option>BTCUSD</option>
          </optgroup>
        </select>
      </ConfigField>
    </div>

    <button className="w-full bg-indigo-600 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]">
      Apply Logic to Active Terminal
    </button>
  </div>
);

const ConfigField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">{label}</label>
    {children}
  </div>
);

export default App;
