
export interface PricePoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  upperChannel: number;
  middleChannel: number;
  lowerChannel: number;
  signal?: 'buy' | 'sell';
}

export interface EAConfig {
  riskPercent: number;
  magicNumber: number;
  slippage: number;
  symbol: string;
  timeframe: string;
}

export interface Trade {
  id: string;
  type: 'BUY' | 'SELL';
  entry: number;
  sl: number;
  tp: number;
  volume: number;
  time: string;
  status: 'OPEN' | 'CLOSED';
  profit: number;
}

export interface TerminalLog {
  id: string;
  time: string;
  type: 'INFO' | 'TRADE' | 'ERROR' | 'WARN';
  message: string;
}

export interface MarketData {
  symbol: string;
  bid: number;
  ask: number;
  change: number;
  direction: 'up' | 'down' | 'flat';
}
