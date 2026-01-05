import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Calendar, Trophy, ChevronDown, CheckCircle2, Settings, Heart, ExternalLink, X } from 'lucide-react';

const FASTING_MODES = [
  { label: '16:8 (Lean Gains)', hours: 16 },
  { label: '18:6 (Warrior)', hours: 18 },
  { label: '20:4 (OMAD)', hours: 20 },
  { label: '12:12 (Beginner)', hours: 12 },
  { label: 'Custom Test (1 min)', hours: 0.017 }, // For testing
];

export default function App() {
  // State
  const [isFasting, setIsFasting] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [selectedMode, setSelectedMode] = useState(FASTING_MODES[0]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Load data from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('fasting_app_data');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setHistory(parsed.history || []);
      setSelectedMode(parsed.selectedMode || FASTING_MODES[0]);
      
      if (parsed.isFasting && parsed.startTime) {
        setIsFasting(true);
        setStartTime(parsed.startTime);
        setElapsed(Date.now() - parsed.startTime);
      }
    }
  }, []);

  // Save data whenever state changes
  useEffect(() => {
    const dataToSave = {
      history,
      selectedMode,
      isFasting,
      startTime
    };
    localStorage.setItem('fasting_app_data', JSON.stringify(dataToSave));
  }, [history, selectedMode, isFasting, startTime]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isFasting && startTime) {
      interval = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [isFasting, startTime]);

  // Format Helpers
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Actions
  const handleToggleFast = () => {
    if (isFasting) {
      // End Fast
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      const durationHours = durationMs / (1000 * 60 * 60);
      const goalMet = durationHours >= selectedMode.hours;

      const newEntry = {
        id: Date.now(),
        start: startTime,
        end: endTime,
        duration: durationMs,
        goal: selectedMode.hours,
        metGoal: goalMet
      };

      setHistory([newEntry, ...history]);
      setIsFasting(false);
      setStartTime(null);
    } else {
      // Start Fast
      setStartTime(Date.now());
      setIsFasting(true);
    }
  };

  const handleResetHistory = () => {
    if(window.confirm("Are you sure you want to clear all history? This cannot be undone.")) {
        setHistory([]);
        setShowSettings(false);
    }
  };

  // Progress Calculation
  const goalMs = selectedMode.hours * 60 * 60 * 1000;
  const progressPercent = Math.min((elapsed / goalMs) * 100, 100);
  const isGoalReached = elapsed >= goalMs;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500 selection:text-white flex flex-col">
      
      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-slate-800/50 backdrop-blur-md sticky top-0 z-10 border-b border-slate-700/50 shrink-0">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-400" />
          Fasting<span className="text-blue-400">Tracker</span>
        </h1>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
                title="History"
            >
                <Calendar className="w-5 h-5 text-slate-300" />
            </button>
            <button 
                onClick={() => setShowSettings(true)}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
                title="Settings"
            >
                <Settings className="w-5 h-5 text-slate-300" />
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md mx-auto p-6 flex flex-col items-center justify-center gap-8">
        
        {/* Mode Selector */}
        {!isFasting && (
          <div className="w-full relative group animate-in slide-in-from-bottom-5 duration-500">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block ml-1">
              Select Protocol
            </label>
            <div className="relative">
              <select 
                value={JSON.stringify(selectedMode)}
                onChange={(e) => setSelectedMode(JSON.parse(e.target.value))}
                className="w-full appearance-none bg-slate-800 border border-slate-700 text-white py-4 px-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
              >
                {FASTING_MODES.map((mode) => (
                  <option key={mode.label} value={JSON.stringify(mode)}>
                    {mode.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Timer UI */}
        <div className="relative w-72 h-72 flex items-center justify-center shrink-0">
          {/* Background Ring */}
          <div className="absolute inset-0 rounded-full border-[6px] border-slate-800"></div>
          
          {/* Active Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="144"
              cy="144"
              r="138"
              fill="none"
              stroke={isGoalReached ? "#22c55e" : "#ef4444"}
              strokeWidth="6"
              strokeDasharray="867" 
              strokeDashoffset={867 - (867 * progressPercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Time Display */}
          <div className="flex flex-col items-center z-10">
             {isFasting ? (
                 <>
                    <span className="text-slate-400 text-sm font-medium mb-1 tracking-widest">ELAPSED TIME</span>
                    <span className={`text-5xl font-bold tabular-nums tracking-tight ${isGoalReached ? 'text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]' : 'text-white'}`}>
                    {formatTime(elapsed)}
                    </span>
                    <span className="text-slate-500 text-xs mt-2 font-medium bg-slate-800/80 px-3 py-1 rounded-full">
                        Goal: {selectedMode.hours} hours
                    </span>
                 </>
             ) : (
                 <>
                    <span className="text-slate-500 text-sm font-medium mb-2 uppercase tracking-wider">Ready to Fast?</span>
                    <span className="text-4xl font-bold text-slate-300">
                        {selectedMode.hours}:{(24-selectedMode.hours)}
                    </span>
                 </>
             )}
          </div>
          
          {/* Glowing Effect */}
          {isFasting && (
            <div className={`absolute inset-0 rounded-full blur-3xl opacity-10 transition-colors duration-500 ${isGoalReached ? 'bg-green-500' : 'bg-red-500'}`}></div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleToggleFast}
          className={`
            w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-95 shadow-lg
            ${isFasting 
              ? 'bg-slate-800 text-red-400 hover:bg-slate-700 border border-slate-700' 
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'
            }
          `}
        >
          {isFasting ? (
            <>
              <Square className="w-5 h-5 fill-current" /> Stop Fasting
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" /> Start Fasting
            </>
          )}
        </button>

        {/* Status Message */}
        {isFasting && isGoalReached && (
            <div className="animate-bounce bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-lg flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Goal reached! You can eat now.
            </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-600">
        <p>
          Part of the <a href="https://the-helpful-dev.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors">The Helpful Dev</a> Network
        </p>
      </footer>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-md max-h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-800 animate-in slide-in-from-bottom-10 duration-300">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h2 className="font-bold text-lg">History</h2>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white">Close</button>
            </div>
            
            <div className="overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                    <p>No completed fasts yet.</p>
                </div>
              ) : (
                  history.map((entry) => (
                    <div key={entry.id} className="bg-slate-800/50 p-4 rounded-xl flex justify-between items-center border border-slate-700/50">
                        <div>
                            <div className="text-sm text-slate-400 mb-1">{formatDate(entry.end)}</div>
                            <div className="font-mono font-medium text-lg text-white">
                                {formatTime(entry.duration)}
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            {entry.metGoal ? (
                                <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-900/30 px-2 py-1 rounded-full border border-green-500/20">
                                    <CheckCircle2 className="w-3 h-3" /> GOAL MET
                                </span>
                            ) : (
                                <span className="text-xs font-bold text-orange-400 bg-orange-900/30 px-2 py-1 rounded-full border border-orange-500/20">
                                    {entry.goal}H TARGET
                                </span>
                            )}
                        </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-700 relative animate-in zoom-in-95 duration-200">
                <button 
                    onClick={() => setShowSettings(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-400" /> Settings
                </h2>

                <div className="space-y-6">
                    {/* Data Management */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Data</h3>
                        <button 
                            onClick={handleResetHistory} 
                            className="w-full flex items-center justify-between p-4 bg-slate-800 rounded-xl hover:bg-red-900/20 text-slate-200 hover:text-red-400 transition-colors border border-slate-700"
                        >
                            <span>Clear All History</span>
                            <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-500">Irreversible</span>
                        </button>
                    </div>

                    {/* Support Section */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Support Development</h3>
                        <div className="p-4 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl border border-indigo-500/30">
                            <p className="text-sm text-indigo-200 mb-4 leading-relaxed">
                                Hi! I built this app to keep fasting simple. If you find it useful, consider buying me a coffee to help cover the server costs!
                            </p>
                            <a 
                                href="https://ko-fi.com/robogirl96" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-[#FF5E5B] hover:bg-[#ff4642] text-white font-bold rounded-lg transition-transform active:scale-95 shadow-lg shadow-red-900/20"
                            >
                                <Heart className="w-4 h-4 fill-white" />
                                Buy me a Coffee
                                <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                        </div>
                    </div>
                    
                    <div className="text-center">
                         <p className="text-xs text-slate-600">Version 1.1.0 • Built with Gemini</p>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}