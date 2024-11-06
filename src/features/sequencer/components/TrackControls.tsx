// src/features/sequencer/components/TrackControls.tsx

import React from 'react';

interface TrackControlsProps {
  trackId: number;
  isMuted: boolean;
  isSolo: boolean;
  onToggleMute: (trackId: number) => void;
  onToggleSolo: (trackId: number) => void;
}

const TrackControls: React.FC<TrackControlsProps> = ({
  trackId,
  isMuted,
  isSolo,
  onToggleMute,
  onToggleSolo,
}) => {
  return (
    <div className="min-w-[72px] w-[72px] mr-2 flex-shrink-0 flex items-center space-x-2 hover:opacity-100 opacity-70 transition ease-in-out duration-150">
      <button
        onClick={() => onToggleMute(trackId)}
        className={`w-8 h-8 rounded-full focus:outline-none transition-colors duration-150 ${isMuted ? 'bg-red-500' : 'bg-gray-300'
          }`}
        aria-label={`${isMuted ? 'Unmute' : 'Mute'} track ${trackId}`}
      >
        M
      </button>
      <button
        onClick={() => onToggleSolo(trackId)}
        className={`w-8 h-8 rounded-full focus:outline-none transition-colors duration-150 ${isSolo ? 'bg-green-500' : 'bg-gray-300'
          }`}
        aria-label={`${isSolo ? 'Unsolo' : 'Solo'} track ${trackId}`}
      >
        S
      </button>
    </div>
  );
};

export default TrackControls;
