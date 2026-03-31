'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { searchAirports, type Airport } from '@/lib/airports';
import Button from './ui/Button';

function AirportInput({
  value,
  onChange,
  placeholder,
  icon,
}: {
  value: string;
  onChange: (code: string, display: string) => void;
  placeholder: string;
  icon: React.ReactNode;
}) {
  const [query, setQuery] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [results, setResults] = useState<Airport[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setDisplayValue(q);
    if (q.length >= 1) {
      const matches = searchAirports(q);
      setResults(matches);
      setOpen(matches.length > 0);
    } else {
      setResults([]);
      setOpen(false);
    }
  }, []);

  const handleSelect = (airport: Airport) => {
    const display = `${airport.city} (${airport.code})`;
    setDisplayValue(display);
    setQuery('');
    setResults([]);
    setOpen(false);
    onChange(airport.code, display);
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
          {icon}
        </div>
        <input
          ref={inputRef}
          value={displayValue}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (displayValue && !value) handleSearch(displayValue);
            else if (!displayValue) setOpen(false);
          }}
          placeholder={placeholder}
          className="w-full bg-surface-light border border-surface-border rounded-xl pl-11 pr-4 py-3.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/30 transition-all text-[16px]"
          autoComplete="off"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-surface-border rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          {results.map((airport) => (
            <button
              key={airport.code}
              type="button"
              onClick={() => handleSelect(airport)}
              className="w-full text-left px-4 py-3 hover:bg-surface-light transition-colors border-b border-surface-border/50 last:border-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-text-primary font-medium">{airport.city}</span>
                  <span className="text-teal font-mono ml-2">({airport.code})</span>
                </div>
                <span className="text-text-muted text-xs">{airport.country}</span>
              </div>
              <div className="text-text-muted text-xs mt-0.5">{airport.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchForm() {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originDisplay, setOriginDisplay] = useState('');
  const [destDisplay, setDestDisplay] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [oneWay, setOneWay] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
    const tmpDisplay = originDisplay;
    setOriginDisplay(destDisplay);
    setDestDisplay(tmpDisplay);
  };

  // Default depart date to 30 days from now
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setDepartDate(d.toISOString().split('T')[0]);
    const r = new Date();
    r.setDate(r.getDate() + 37);
    setReturnDate(r.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !departDate) return;

    setLoading(true);
    const params = new URLSearchParams({
      origin,
      destination,
      departDate,
      ...(returnDate && !oneWay ? { returnDate } : {}),
      passengers: String(passengers),
    });
    router.push(`/results?${params}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      {/* Origin */}
      <AirportInput
        value={origin}
        onChange={(code, display) => { setOrigin(code); setOriginDisplay(display); }}
        placeholder="Where from?"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
          </svg>
        }
      />

      {/* Swap Button */}
      <div className="flex justify-center -my-1.5 relative z-10">
        <button
          type="button"
          onClick={handleSwap}
          className="w-10 h-10 rounded-full bg-surface-light border border-surface-border flex items-center justify-center text-text-muted hover:text-teal hover:border-teal/30 transition-all active:scale-90"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 16V4m0 12-4-4m4 4 4-4M17 8v12m0-12 4 4m-4-4-4 4"/>
          </svg>
        </button>
      </div>

      {/* Destination */}
      <AirportInput
        value={destination}
        onChange={(code, display) => { setDestination(code); setDestDisplay(display); }}
        placeholder="Where to?"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 22h20"/>
            <path d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2L22 5l-1.97 10.13a2 2 0 0 1-1.66 1.6L6.36 17.4z"/>
          </svg>
        }
      />

      {/* Dates Row */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-text-muted text-xs mb-1 block pl-1">Depart</label>
          <input
            type="date"
            value={departDate}
            onChange={(e) => setDepartDate(e.target.value)}
            min={today}
            className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/30 transition-all text-[16px]"
          />
        </div>
        {!oneWay && (
          <div className="flex-1">
            <label className="text-text-muted text-xs mb-1 block pl-1">Return</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={departDate || today}
              className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/30 transition-all text-[16px]"
            />
          </div>
        )}
      </div>

      {/* One-way toggle + Passengers */}
      <div className="flex items-center justify-between px-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            role="switch"
            aria-checked={oneWay}
            onClick={() => setOneWay(!oneWay)}
            className={`relative w-10 h-6 rounded-full transition-colors ${oneWay ? 'bg-teal' : 'bg-surface-light border border-surface-border'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${oneWay ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-text-secondary text-sm">One way</span>
        </label>

        <div className="flex items-center gap-3">
          <span className="text-text-muted text-sm">Travelers</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPassengers(Math.max(1, passengers - 1))}
              className="w-8 h-8 rounded-lg bg-surface-light border border-surface-border text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
            >
              -
            </button>
            <span className="w-8 text-center text-text-primary font-medium">{passengers}</span>
            <button
              type="button"
              onClick={() => setPassengers(Math.min(9, passengers + 1))}
              className="w-8 h-8 rounded-lg bg-surface-light border border-surface-border text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        disabled={!origin || !destination || !departDate}
        className="w-full mt-2 text-base font-bold tracking-wide"
      >
        Predict My Fare
      </Button>
    </form>
  );
}
