
import React from 'react';
import { Copy, Download, ExternalLink } from 'lucide-react';

const MQLCodeViewer: React.FC<{ code: string }> = ({ code }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[70vh]">
        <div className="bg-slate-800/50 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="ml-4 text-xs font-mono text-slate-400">FlowShift_v1.0.mq5</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopy} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
              <Copy className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-6 bg-[#0d1117]">
          <pre className="font-mono text-sm leading-relaxed text-slate-300">
            {code.split('\n').map((line, i) => (
              <div key={i} className="flex gap-6 group">
                <span className="w-8 text-right text-slate-600 select-none group-hover:text-slate-400 transition-colors">
                  {i + 1}
                </span>
                <span className="flex-1 whitespace-pre">
                  {line.startsWith('//') ? (
                    <span className="text-slate-500 italic">{line}</span>
                  ) : line.startsWith('#') ? (
                    <span className="text-indigo-400">{line}</span>
                  ) : line.includes('input') || line.includes('double') || line.includes('int') ? (
                    <span className="text-rose-400">{line}</span>
                  ) : (
                    line
                  )}
                </span>
              </div>
            ))}
          </pre>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center text-xs text-slate-500">
          <div className="flex gap-4">
            <span>Lines: {code.split('\n').length}</span>
            <span>Standard: MQL5 (Strict)</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-indigo-400 transition-colors">
            MQL5 Reference <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MQLCodeViewer;
