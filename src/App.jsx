import React, { useState, useEffect, useRef } from 'react';
import { Analytics } from "@vercel/analytics/react";
import {
  Square, Clock, Calendar, CheckCircle2, Settings,
  Heart, ExternalLink, X, Pencil, Flame, Trash2,
  Sun, Moon, MoreHorizontal,
} from 'lucide-react';

const FASTING_MODES = [
  { label: '16:8 (Lean Gains)', hours: 16 },
  { label: '18:6 (Warrior)',    hours: 18 },
  { label: '20:4 (OMAD)',       hours: 20 },
  { label: '12:12 (Beginner)',  hours: 12 },
  { label: 'Custom Test (1 min)', hours: 0.017 },
];

const getModeShortLabel = (mode) =>
  mode.label.includes('Test') ? 'Test' : mode.label.split(' ')[0];

// SVG ring constants (viewBox 300×300)
const RING_R    = 135;
const RING_CIRC = Math.round(2 * Math.PI * RING_R); // 848

export default function App() {
  // ── Existing data state (schema untouched) ──────────────
  const [isFasting,    setIsFasting]    = useState(false);
  const [startTime,    setStartTime]    = useState(null);
  const [elapsed,      setElapsed]      = useState(0);
  const [selectedMode, setSelectedMode] = useState(FASTING_MODES[0]);
  const [history,      setHistory]      = useState([]);

  // ── Existing UI state ───────────────────────────────────
  const [showHistory,    setShowHistory]    = useState(false);
  const [showSettings,   setShowSettings]   = useState(false);
  const [showManualStart,setShowManualStart] = useState(false);
  const [editingEntry,   setEditingEntry]   = useState(null);

  // ── New UI state ────────────────────────────────────────
  const [theme,          setTheme]          = useState('light');
  const [showToast,      setShowToast]      = useState(false);
  const [activeMenuId,   setActiveMenuId]   = useState(null);   // three-dot menu open
  const [deletingEntryId,setDeletingEntryId]= useState(null);   // inline delete confirm
  const [editError,      setEditError]      = useState('');

  const deleteTimerRef = useRef(null);
  const toastShownRef  = useRef(false);

  // ── Load from localStorage ──────────────────────────────
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
    const savedTheme = localStorage.getItem('fasting_app_theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
  }, []);

  // ── Save data to localStorage ───────────────────────────
  useEffect(() => {
    localStorage.setItem('fasting_app_data',
      JSON.stringify({ history, selectedMode, isFasting, startTime }));
  }, [history, selectedMode, isFasting, startTime]);

  // ── Apply dark class + persist theme ───────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('fasting_app_theme', theme);
  }, [theme]);

  // ── Timer ───────────────────────────────────────────────
  useEffect(() => {
    let interval;
    if (isFasting && startTime) {
      interval = setInterval(() => setElapsed(Date.now() - startTime), 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [isFasting, startTime]);

  // ── Derived progress values ─────────────────────────────
  const goalMs        = selectedMode.hours * 60 * 60 * 1000;
  const progressPercent = Math.min((elapsed / goalMs) * 100, 100);
  const isGoalReached   = isFasting && elapsed >= goalMs;

  // ── Goal-reached toast (fires once per fast) ────────────
  useEffect(() => {
    if (isGoalReached && !toastShownRef.current) {
      toastShownRef.current = true;
      setShowToast(true);
      const t = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(t);
    }
    if (!isFasting) toastShownRef.current = false;
  }, [isGoalReached, isFasting]);

  // ── Inline delete auto-confirm after 3 s ───────────────
  useEffect(() => {
    if (deletingEntryId) {
      deleteTimerRef.current = setTimeout(() => {
        setHistory(prev => prev.filter(h => h.id !== deletingEntryId));
        setDeletingEntryId(null);
      }, 3000);
    }
    return () => clearTimeout(deleteTimerRef.current);
  }, [deletingEntryId]);

  // ── Format helpers ──────────────────────────────────────
  const formatTime = (ms) => {
    const s   = Math.floor(ms / 1000);
    const h   = Math.floor(s / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const formatDurationShort = (ms) => {
    if (!ms) return '—';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const getLocalISOString = (date) => {
    const d = date ? new Date(date) : new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  // ── Streak calculation (unchanged logic) ────────────────
  const calculateStreak = () => {
    const successfulFasts = history.filter(h => h.metGoal);
    if (!successfulFasts.length) return 0;
    const uniqueDates = new Set(
      successfulFasts.map(f => new Date(f.end).setHours(0, 0, 0, 0))
    );
    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    if (uniqueDates.has(checkDate.getTime())) {
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      if (uniqueDates.has(checkDate.getTime())) {
        streak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else return 0;
    }
    while (uniqueDates.has(checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  // ── Summary stats (computed from existing history) ──────
  const longestFast  = history.length ? Math.max(...history.map(h => h.duration)) : 0;
  const totalFasts   = history.length;
  const avgDuration  = history.length
    ? history.reduce((s, h) => s + h.duration, 0) / history.length
    : 0;

  // ── Action handlers (logic unchanged) ──────────────────
  const handleToggleFast = () => {
    if (isFasting) {
      const endTime    = Date.now();
      const durationMs = endTime - startTime;
      const goalMet    = (durationMs / 3600000) >= selectedMode.hours;
      setHistory([
        { id: Date.now(), start: startTime, end: endTime,
          duration: durationMs, goal: selectedMode.hours, metGoal: goalMet },
        ...history,
      ]);
      setIsFasting(false);
      setStartTime(null);
    } else {
      setStartTime(Date.now());
      setIsFasting(true);
    }
  };

  const handleManualStartSubmit = (e) => {
    e.preventDefault();
    const dateStr = new FormData(e.target).get('startTime');
    if (dateStr) {
      const ts = new Date(dateStr).getTime();
      if (!isNaN(ts)) {
        setStartTime(ts);
        setIsFasting(true);
        setShowManualStart(false);
      }
    }
  };

  const handleResetHistory = () => {
    if (window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      setHistory([]);
      setShowSettings(false);
    }
  };

  const handleEditEntry = (entry) => {
    setEditError('');
    setEditingEntry(entry);
    setShowHistory(false);
    setActiveMenuId(null);
  };

  const handleUpdateEntry = (e) => {
    e.preventDefault();
    const fd       = new FormData(e.target);
    const newStart = new Date(fd.get('startTime')).getTime();
    const newEnd   = new Date(fd.get('endTime')).getTime();
    if (newEnd <= newStart) {
      setEditError('End time must be after start time.');
      return;
    }
    setEditError('');
    const durationMs = newEnd - newStart;
    const goalMet    = (durationMs / 3600000) >= editingEntry.goal;
    setHistory(history.map(item =>
      item.id === editingEntry.id
        ? { ...editingEntry, start: newStart, end: newEnd, duration: durationMs, metGoal: goalMet }
        : item
    ));
    setEditingEntry(null);
    setShowHistory(true);
  };

  // ── Inline delete handlers ──────────────────────────────
  const handleInlineDelete = (entryId) => {
    setActiveMenuId(null);
    setDeletingEntryId(entryId);
  };

  const handleUndoDelete = () => setDeletingEntryId(null);

  const handleConfirmDeleteNow = () => {
    setHistory(prev => prev.filter(h => h.id !== deletingEntryId));
    setDeletingEntryId(null);
  };

  const closeHistory = () => {
    setShowHistory(false);
    setActiveMenuId(null);
    setDeletingEntryId(null);
  };

  // ── Shared modal classes ────────────────────────────────
  const overlayClass = 'fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-[4px]';
  const sheetClass   = 'modal-sheet w-full sm:max-w-[480px] sm:w-[calc(100%-48px)] max-h-[90vh] flex flex-col overflow-hidden rounded-t-[20px] sm:rounded-[20px] shadow-2xl';

  // ── Drag handle (mobile only) ───────────────────────────
  const DragHandle = () => (
    <div className="flex justify-center pt-3 pb-1 sm:hidden" aria-hidden="true">
      <div className="w-8 h-1 rounded-full" style={{ background: 'var(--border)' }} />
    </div>
  );

  // ── Modal header row ────────────────────────────────────
  const ModalHeader = ({ title, onClose }) => (
    <div className="flex justify-between items-center px-6 py-4"
         style={{ borderBottom: '1px solid var(--border)' }}>
      <h2 className="text-xl font-serif" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      <button
        onClick={onClose}
        aria-label="Close"
        className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
        style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
      >
        <X size={16} strokeWidth={1.5} />
      </button>
    </div>
  );

  // ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* ── Header ────────────────────────────────────────── */}
      <header
        className="h-14 px-6 flex justify-between items-center sticky top-0 z-10 shrink-0"
        style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}
      >
        <h1 className="text-xl font-serif tracking-[-0.01em]">
          Fasting<span style={{ color: 'var(--accent)' }}>Tracker</span>
        </h1>

        <div className="flex items-center gap-2">
          {/* History — given visual priority with slightly bolder background */}
          <button
            onClick={() => setShowHistory(true)}
            title="History"
            aria-label="View fasting history"
            className="w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          >
            <Calendar size={16} strokeWidth={1.5} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
            className="w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
          >
            {theme === 'dark' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            title="Settings"
            aria-label="Open settings"
            className="w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
          >
            <Settings size={16} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* ── Main hero zone ─────────────────────────────────── */}
      <main className="flex-1 w-full max-w-md mx-auto px-6 pt-8 pb-4 flex flex-col items-center gap-6">

        {/* Streak badge */}
        {currentStreak > 0 && (
          <div
            className="streak-in flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-semibold"
            style={{ background: 'rgba(196,154,60,0.12)', color: 'var(--accent-gold)' }}
            aria-label={`${currentStreak}-day streak`}
          >
            <Flame size={16} strokeWidth={1.5} />
            {currentStreak}-day streak
          </div>
        )}

        {/* Protocol chip — always visible, opens settings */}
        <button
          onClick={() => setShowSettings(true)}
          aria-label="Change fasting protocol"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] transition-opacity hover:opacity-70"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            minHeight: 'unset',
          }}
        >
          {getModeShortLabel(selectedMode)} Protocol
          <Settings size={11} strokeWidth={1.5} />
        </button>

        {/* Progress ring */}
        <div
          className="relative w-[min(280px,72vw)] sm:w-[300px] aspect-square shrink-0"
          role="img"
          aria-label={isFasting
            ? `Fasting in progress — ${formatTime(elapsed)} elapsed`
            : 'Not currently fasting'}
        >
          {/* Glow behind ring (active fasting only) */}
          {isFasting && (
            <div
              className={isGoalReached ? 'ring-glow-intense' : 'ring-glow'}
              style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: `radial-gradient(circle, var(--${isGoalReached ? 'success' : 'accent'}) 0%, transparent 65%)`,
                opacity: isGoalReached ? 0.2 : 0.12,
              }}
              aria-hidden="true"
            />
          )}

          {/* SVG ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 300 300"
            aria-hidden="true"
          >
            {/* Track */}
            <circle cx="150" cy="150" r={RING_R} fill="none" stroke="var(--border)" strokeWidth="10" />
            {/* Progress fill */}
            <circle
              cx="150" cy="150" r={RING_R}
              fill="none"
              stroke={isGoalReached ? 'var(--success)' : 'var(--accent)'}
              strokeWidth="10"
              strokeDasharray={RING_CIRC}
              strokeDashoffset={isFasting ? RING_CIRC - (RING_CIRC * progressPercent) / 100 : RING_CIRC}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Timer text — overlaid in ring center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span
              className="text-7xl font-serif tabular-nums leading-none tracking-[-0.02em]"
              style={{ color: isGoalReached ? 'var(--success)' : 'var(--text-primary)' }}
            >
              {formatTime(isFasting ? elapsed : 0)}
            </span>
            <span className="text-[13px] mt-2" style={{ color: 'var(--text-secondary)' }}>
              {isFasting ? `Goal: ${selectedMode.hours}h` : 'Ready to fast'}
            </span>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleToggleFast}
          aria-label={isFasting ? 'End fast' : 'Begin fast'}
          className={`h-14 rounded-full text-[15px] font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${isFasting ? 'btn-warn' : 'btn-primary'}`}
          style={{
            width: '220px',
            background: isFasting ? 'var(--accent-warn)' : 'var(--accent)',
            color: 'white',
          }}
        >
          {isFasting
            ? <><Square size={16} strokeWidth={1.5} fill="currentColor" /> End Fast</>
            : 'Begin Fast'
          }
        </button>

        {/* Manual start link — always visible, disabled while fasting */}
        <button
          onClick={() => !isFasting && setShowManualStart(true)}
          aria-disabled={isFasting}
          className="flex items-center gap-1.5 text-[13px] transition-opacity"
          style={{
            color: 'var(--text-secondary)',
            opacity: isFasting ? 0.35 : 1,
            cursor: isFasting ? 'default' : 'pointer',
            background: 'none', border: 'none',
            minHeight: 'unset',
          }}
        >
          <Clock size={13} strokeWidth={1.5} />
          Set start time
        </button>
      </main>

      {/* ── Summary strip ──────────────────────────────────── */}
      <div className="w-full max-w-md mx-auto px-6 pb-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Longest Fast', value: formatDurationShort(longestFast) },
            { label: 'Total Fasts',  value: totalFasts || '—' },
            { label: 'Average',      value: formatDurationShort(avgDuration) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col gap-1 p-4 rounded-2xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.03em] leading-none"
                style={{ color: 'var(--text-secondary)' }}
              >
                {label}
              </span>
              <span
                className="text-2xl font-serif leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer
        className="px-6 py-4 flex justify-between items-center text-[11px]"
        style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}
      >
        <a
          href="https://thehelpfuldev.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          style={{ color: 'var(--text-secondary)', minHeight: 'unset', minWidth: 'unset' }}
        >
          thehelpfuldev.com
        </a>
        <span>Version 1.1.0</span>
      </footer>

      {/* ── Goal-reached toast ─────────────────────────────── */}
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="toast-in fixed bottom-6 left-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-[14px] font-medium"
          style={{
            transform: 'translateX(-50%)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--success)',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
          }}
        >
          Goal reached · Well done
        </div>
      )}

      {/* ── History Modal ──────────────────────────────────── */}
      {showHistory && (
        <div className={overlayClass} onClick={closeHistory}>
          <div
            className={sheetClass}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-title"
          >
            <DragHandle />
            <div className="flex justify-between items-center px-6 py-4"
                 style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 id="history-title" className="text-xl font-serif" style={{ color: 'var(--text-primary)' }}>
                Fasting History
              </h2>
              <button
                onClick={closeHistory}
                aria-label="Close history"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Clock size={40} strokeWidth={1} style={{ color: 'var(--border)', minHeight: 'unset', minWidth: 'unset' }} />
                  <p className="text-[15px] text-center leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    No fasts recorded yet.<br />Start your first fast above.
                  </p>
                </div>
              ) : (
                history.map(entry => (
                  <div
                    key={entry.id}
                    className="rounded-2xl p-4"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                  >
                    {/* Inline delete confirmation */}
                    {deletingEntryId === entry.id ? (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                          Delete this entry?
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={handleUndoDelete}
                            className="px-3 py-1.5 rounded-full text-[13px] font-semibold transition-opacity hover:opacity-70"
                            style={{
                              background: 'var(--bg-surface)', color: 'var(--text-secondary)',
                              border: '1px solid var(--border)', minHeight: 'unset',
                            }}
                          >
                            Undo
                          </button>
                          <button
                            onClick={handleConfirmDeleteNow}
                            className="px-3 py-1.5 rounded-full text-[13px] font-semibold transition-opacity hover:opacity-70"
                            style={{ background: 'var(--accent-warn)', color: 'white', minHeight: 'unset' }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Normal card view */
                      <div className="flex items-center gap-4">
                        {/* Date column */}
                        <div className="flex flex-col items-center min-w-[36px]">
                          <span className="text-xl font-serif leading-none" style={{ color: 'var(--text-primary)' }}>
                            {new Date(entry.start).getDate()}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(entry.start).toLocaleDateString(undefined, { month: 'short' })}
                          </span>
                          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(entry.start).toLocaleDateString(undefined, { weekday: 'short' })}
                          </span>
                        </div>

                        {/* Vertical divider */}
                        <div className="w-px self-stretch" style={{ background: 'var(--border)' }} aria-hidden="true" />

                        {/* Duration + status */}
                        <div className="flex-1 flex flex-col gap-1">
                          <span className="text-2xl font-serif leading-none" style={{ color: 'var(--text-primary)' }}>
                            {formatDurationShort(entry.duration)}
                          </span>
                          {entry.metGoal ? (
                            <span
                              className="flex items-center gap-1 text-[11px] font-semibold"
                              style={{ color: 'var(--success)', minHeight: 'unset', minWidth: 'unset' }}
                            >
                              <CheckCircle2 size={11} strokeWidth={2} style={{ minHeight: 'unset', minWidth: 'unset' }} />
                              Goal met
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                              {entry.goal}h target
                            </span>
                          )}
                        </div>

                        {/* Three-dot menu */}
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === entry.id ? null : entry.id)}
                            aria-label="Entry options"
                            aria-expanded={activeMenuId === entry.id}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <MoreHorizontal size={16} strokeWidth={1.5} />
                          </button>

                          {activeMenuId === entry.id && (
                            <div
                              className="absolute right-0 top-10 z-10 rounded-xl overflow-hidden shadow-lg"
                              style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border)',
                                minWidth: '120px',
                              }}
                            >
                              <button
                                onClick={() => handleEditEntry(entry)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-[13px] text-left hover:opacity-70 transition-opacity"
                                style={{ color: 'var(--text-primary)', minHeight: 'unset' }}
                              >
                                <Pencil size={13} strokeWidth={1.5} style={{ minHeight: 'unset', minWidth: 'unset' }} />
                                Edit
                              </button>
                              <div style={{ height: '1px', background: 'var(--border)' }} />
                              <button
                                onClick={() => handleInlineDelete(entry.id)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-[13px] text-left hover:opacity-70 transition-opacity"
                                style={{ color: 'var(--accent-warn)', minHeight: 'unset' }}
                              >
                                <Trash2 size={13} strokeWidth={1.5} style={{ minHeight: 'unset', minWidth: 'unset' }} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Modal ─────────────────────────────────── */}
      {showSettings && (
        <div className={overlayClass} onClick={() => setShowSettings(false)}>
          <div
            className={sheetClass}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
          >
            <DragHandle />
            <div className="flex justify-between items-center px-6 py-4"
                 style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 id="settings-title" className="text-xl font-serif" style={{ color: 'var(--text-primary)' }}>
                Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-6">
              {/* Protocol — segmented control */}
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.03em]"
                      style={{ color: 'var(--text-secondary)' }}>
                  Protocol
                </span>
                <div className="flex flex-wrap gap-2">
                  {FASTING_MODES.map(mode => {
                    const active = selectedMode.label === mode.label;
                    return (
                      <button
                        key={mode.label}
                        onClick={() => setSelectedMode(mode)}
                        className="px-4 py-2 rounded-full text-[13px] font-semibold transition-all hover:opacity-80"
                        style={{
                          background: active ? 'var(--accent)' : 'var(--bg-elevated)',
                          color: active ? 'white' : 'var(--text-secondary)',
                          border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                          minHeight: 'unset',
                        }}
                        aria-pressed={active}
                      >
                        {getModeShortLabel(mode)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Data management */}
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.03em]"
                      style={{ color: 'var(--text-secondary)' }}>
                  Data
                </span>
                <button
                  onClick={handleResetHistory}
                  className="w-full py-3 px-4 rounded-xl text-[14px] font-semibold text-left transition-opacity hover:opacity-70"
                  style={{
                    border: '1px solid var(--accent-warn)',
                    color: 'var(--accent-warn)',
                    background: 'transparent',
                    minHeight: 'unset',
                  }}
                >
                  Clear All History
                </button>
              </div>

              {/* Support */}
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.03em]"
                      style={{ color: 'var(--text-secondary)' }}>
                  Support
                </span>
                <div className="p-4 rounded-xl flex flex-col gap-3"
                     style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Built this app to keep fasting simple. If you find it useful, consider a coffee to help cover server costs!
                  </p>
                  <a
                    href="https://ko-fi.com/robogirl96"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-[13px] font-semibold transition-opacity hover:opacity-80"
                    style={{ background: '#FF5E5B', color: 'white', minHeight: 'unset' }}
                  >
                    <Heart size={14} strokeWidth={1.5} fill="white" style={{ minHeight: 'unset', minWidth: 'unset' }} />
                    Buy me a Coffee
                    <ExternalLink size={12} strokeWidth={1.5} style={{ minHeight: 'unset', minWidth: 'unset' }} />
                  </a>
                </div>
              </div>

              <p className="text-center text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                Version 1.1.0 · Built with Gemini
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Manual Start Modal ─────────────────────────────── */}
      {showManualStart && (
        <div className={overlayClass} onClick={() => setShowManualStart(false)}>
          <div
            className={sheetClass}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="manual-start-title"
          >
            <DragHandle />
            <ModalHeader title="Set Start Time" onClose={() => setShowManualStart(false)} />

            <div className="p-6">
              <p className="text-[14px] mb-6" style={{ color: 'var(--text-secondary)' }}>
                Forgot to start the timer? Pick when you started fasting.
              </p>
              <form onSubmit={handleManualStartSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="manual-start-input"
                    className="text-[11px] font-semibold uppercase tracking-[0.03em]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Start time
                  </label>
                  <input
                    id="manual-start-input"
                    type="datetime-local"
                    name="startTime"
                    required
                    max={getLocalISOString()}
                    className="w-full rounded-[10px] px-4 py-3 text-[14px]"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="h-14 rounded-full text-[15px] font-semibold transition-opacity hover:opacity-80"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  Begin Fast
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Entry Modal ───────────────────────────────── */}
      {editingEntry && (
        <div
          className={overlayClass}
          onClick={() => { setEditingEntry(null); setShowHistory(true); }}
        >
          <div
            className={sheetClass}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-entry-title"
          >
            <DragHandle />
            <ModalHeader
              title="Edit Entry"
              onClose={() => { setEditingEntry(null); setShowHistory(true); }}
            />

            <div className="p-6">
              <p className="text-[14px] mb-6" style={{ color: 'var(--text-secondary)' }}>
                Adjust the start and end times for this entry.
              </p>
              <form onSubmit={handleUpdateEntry} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="edit-start"
                    className="text-[11px] font-semibold uppercase tracking-[0.03em]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Start time
                  </label>
                  <input
                    id="edit-start"
                    type="datetime-local"
                    name="startTime"
                    required
                    defaultValue={getLocalISOString(editingEntry.start)}
                    max={getLocalISOString()}
                    className="w-full rounded-[10px] px-4 py-3 text-[14px]"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="edit-end"
                    className="text-[11px] font-semibold uppercase tracking-[0.03em]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    End time
                  </label>
                  <input
                    id="edit-end"
                    type="datetime-local"
                    name="endTime"
                    required
                    defaultValue={getLocalISOString(editingEntry.end)}
                    max={getLocalISOString()}
                    className="w-full rounded-[10px] px-4 py-3 text-[14px]"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Inline validation error */}
                {editError && (
                  <p className="text-[13px]" role="alert" style={{ color: 'var(--accent-warn)' }}>
                    {editError}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setEditingEntry(null); setShowHistory(true); }}
                    className="flex-1 py-3 rounded-full text-[14px] font-semibold transition-opacity hover:opacity-70"
                    style={{
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      minHeight: 'unset',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full text-[14px] font-semibold transition-opacity hover:opacity-80"
                    style={{ background: 'var(--accent)', color: 'white', minHeight: 'unset' }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Analytics />
    </div>
  );
}
