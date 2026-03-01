'use client';

import React from 'react';

interface VideoPlayerProps {
  url: string;
  onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
  onEnded?: () => void;
  onError?: () => void;
  autoSaveProgress?: boolean;
  initialTime?: number;
}

export function VideoPlayer(props: VideoPlayerProps) {
  return (
    <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center p-4">
          <p className="text-white font-medium">Video Player</p>
          <p className="text-white/70 text-sm">
            Player temporariamente indisponível durante a migração
          </p>
          <p className="text-white/50 text-xs">URL: {props.url}</p>
        </div>
      </div>
    </div>
  );
}