'use client';

import { useState } from 'react';
import Button from './ui/Button';

interface WatchButtonProps {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
}

export default function WatchButton({ origin, destination, departDate, returnDate }: WatchButtonProps) {
  const [watching, setWatching] = useState(false);

  const handleWatch = () => {
    // Phase 2: auth + save to Neon
    // For now, just toggle the visual state
    setWatching(!watching);
  };

  if (watching) {
    return (
      <Button variant="secondary" size="lg" className="flex-1" onClick={handleWatch}>
        <svg className="w-5 h-5 mr-2 text-teal" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        Watching
      </Button>
    );
  }

  return (
    <Button variant="primary" size="lg" className="flex-1" onClick={handleWatch}>
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      Watch This Trip
    </Button>
  );
}
