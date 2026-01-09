import React, { useState, useEffect } from 'react';
// UNCOMMENT THE LINE BELOW FOR VERCEL DEPLOYMENT
// import { Analytics } from "@vercel/analytics/react"; 
import { Play, Square, Clock, Calendar, Trophy, ChevronDown, CheckCircle2, Settings, Heart, ExternalLink, X, Pencil, Flame, Trash2, Info } from 'lucide-react';

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
  const [showManualStart, setShowManualStart] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [showProtocolHint, setShowProtocolHint] = useState(false); // Tooltip state
  
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

  const getLocalISOString = (date) => {
    const d = date ? new Date(date) : new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
  };

  const calculateStreak = () => {
    // 1. Get all successful fasts
    const successfulFasts = history.filter(h => h.metGoal);
    if (successfulFasts.length === 0) return 0;

    // 2. Get unique dates (normalized to midnight)
    const uniqueDates = new Set(
      successfulFasts.map(f => new Date(f.end).setHours(0, 0, 0, 0))
    );

    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0); // Start with Today

    // 3. Logic:
    // If we fasted Today, streak starts at 1, next check is Yesterday.
    // If NOT Today, but we fasted Yesterday, streak starts at 1, next check is Day Before Yesterday.
    // If neither, streak is 0.

    if (uniqueDates.has(checkDate.getTime())) {
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checkDate.setDate(checkDate.getDate() - 1); // Check yesterday
      if (uniqueDates.has(checkDate.getTime())) {
        streak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        return 0;
      }
    }

    // 4. Count backwards
    while (true) {
      if (uniqueDates.has(checkDate.getTime())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

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

  const handleManualStartSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dateStr = formData.get('startTime');
    
    if (dateStr) {
      const timestamp = new Date(dateStr).getTime();
      
      if (isNaN(timestamp)) return;

      setStartTime(timestamp);
      setIsFasting(true);
      setShowManualStart(false);
    }
  };

  const handleResetHistory = () => {
    if(window.confirm("Are you sure you want to clear all history? This cannot be undone.")) {
        setHistory([]);
        setShowSettings(false);
    }
  };

  const handleDeleteEntry = (entry) => {
    setEntryToDelete(entry);
    setShowHistory(false); // Close history temporarily
  };

  const confirmDelete = () => {
    if (entryToDelete) {
        setHistory(history.filter(h => h.id !== entryToDelete.id));
        setEntryToDelete(null);
        setShowHistory(true); // Return to history
    }
  };

  const cancelDelete = () => {
    setEntryToDelete(null);
    setShowHistory(true); // Return to history
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setShowHistory(false); // Close history temporarily
  };

  const handleUpdateEntry = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const startStr = formData.get('startTime');
    const endStr = formData.get('endTime');

    if (startStr && endStr) {
      const newStart = new Date(startStr).getTime();
      const newEnd = new Date(endStr).getTime();

      if (newEnd <= newStart) {
        alert("End time must be after start time");
        return;
      }

      const durationMs = newEnd - newStart;
      const durationHours = durationMs / (1000 * 60 * 60);
      const goalMet = durationHours >= editingEntry.goal;

      const updatedEntry = {
        ...editingEntry,
        start: newStart,
        end: newEnd,
        duration: durationMs,
        metGoal: goalMet
      };

      setHistory(history.map(item => item.id === editingEntry.id ? updatedEntry : item));
      setEditingEntry(null);
      setShowHistory(true); // Re-open history
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
        
        {/* Streak Counter (Only shows if streak > 0) */}
        {currentStreak > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-500">
                <Flame className="w-4 h-4 fill-current" />
                <span>{currentStreak} Day Streak</span>
            </div>
        )}

        {/* Current Protocol Display (Info Icon) */}
        {!isFasting && (
          <div className="relative z-0 flex flex-col items-center gap-2 animate-in slide-in-from-bottom-5 duration-500">
            <button 
                className="group relative flex items-center gap-2 px-5 py-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-full border border-slate-700/50 hover:border-slate-600 transition-all text-slate-300 text-sm font-medium"
                onClick={() => setShowProtocolHint(!showProtocolHint)}
                onMouseEnter={() => setShowProtocolHint(true)}
                onMouseLeave={() => setShowProtocolHint(false)}
            >
                <span>{selectedMode.label}</span>
                <Info className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                
                {/* Tooltip */}
                <div className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-400 text-center shadow-2xl transition-all duration-200 pointer-events-none z-20 ${showProtocolHint ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                    Configure your fasting protocol in the Settings menu.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                </div>
            </button>
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

        {/* Action Button & Manual Start Link */}
        <div className="w-full flex flex-col items-center gap-4">
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

          {!isFasting && (
            <button 
              onClick={() => setShowManualStart(true)}
              className="text-slate-500 hover:text-blue-400 text-sm font-medium transition-colors"
            >
              Already fasting?
            </button>
          )}
        </div>

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
                        <div className="flex-1">
                            <div className="flex flex-col mb-1">
                                <span className="text-xs text-slate-500">Start: {formatDate(entry.start)}</span>
                                <span className="text-sm text-slate-400">End: {formatDate(entry.end)}</span>
                            </div>
                            <div className="font-mono font-medium text-lg text-white">
                                {formatTime(entry.duration)}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {entry.metGoal ? (
                                <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-900/30 px-2 py-1 rounded-full border border-green-500/20">
                                    <CheckCircle2 className="w-3 h-3" /> GOAL MET
                                </span>
                            ) : (
                                <span className="text-xs font-bold text-orange-400 bg-orange-900/30 px-2 py-1 rounded-full border border-orange-500/20">
                                    {entry.goal}H TARGET
                                </span>
                            )}
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => handleEditEntry(entry)}
                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-full transition-all"
                                    title="Edit"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDeleteEntry(entry)}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-full transition-all"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-700 relative animate-in zoom-in-95 duration-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                    <Trash2 className="w-5 h-5 text-red-400" /> Delete Entry
                </h2>
                <p className="text-slate-300 mb-6">
                    Are you sure you want to delete the fast from <span className="text-white font-medium">{formatDate(entryToDelete.start)}</span>? This cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={cancelDelete}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors"
                    >
                        Delete
                    </button>
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
                    {/* Protocol Selection (Moved here) */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider block">
                            Fasting Protocol
                        </label>
                        <div className="relative">
                            <select 
                                value={JSON.stringify(selectedMode)}
                                onChange={(e) => setSelectedMode(JSON.parse(e.target.value))}
                                className="w-full appearance-none bg-slate-800 border border-slate-700 text-white py-4 px-5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
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

      {/* Manual Start Modal */}
      {showManualStart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-700 relative animate-in zoom-in-95 duration-200">
                <button 
                    onClick={() => setShowManualStart(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" /> Set Start Time
                </h2>
                
                <p className="text-sm text-slate-400 mb-6">
                    Forgot to start the timer? No problem. Pick when you started fasting.
                </p>

                <form onSubmit={handleManualStartSubmit} className="space-y-4">
                    <input 
                        type="datetime-local" 
                        name="startTime"
                        required
                        max={getLocalISOString()}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    
                    <button 
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
                    >
                        Start Fasting
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-700 relative animate-in zoom-in-95 duration-200">
                <button 
                    onClick={() => {
                        setEditingEntry(null);
                        setShowHistory(true);
                    }}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-blue-400" /> Edit Fast
                </h2>
                
                <form onSubmit={handleUpdateEntry} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Start Time</label>
                        <input 
                            type="datetime-local" 
                            name="startTime"
                            required
                            defaultValue={getLocalISOString(editingEntry.start)}
                            max={getLocalISOString()}
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">End Time</label>
                        <input 
                            type="datetime-local" 
                            name="endTime"
                            required
                            defaultValue={getLocalISOString(editingEntry.end)}
                            max={getLocalISOString()}
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* UNCOMMENT THE LINE BELOW FOR VERCEL DEPLOYMENT */}
      {/* <Analytics /> */}
    </div>
  );
}