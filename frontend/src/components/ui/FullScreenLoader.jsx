import React from 'react';

// Minimal full-screen spinner only
export default function FullScreenLoader({ label = 'Loading…' }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="relative w-12 h-12 mb-3">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-transparent border-primary animate-spin"></div>
        </div>
        <span className="text-sm text-text-secondary">{label}</span>
      </div>
    </div>
  );
}


