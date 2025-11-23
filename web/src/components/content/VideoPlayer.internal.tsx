'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipForward,
  SkipBack,
  PictureInPicture,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VideoPlayerProps {
  url: string;

  onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
  onEnded?: () => void;
  onError?: () => void;
  autoSaveProgress?: boolean;
  initialTime?: number;
}

// Detecta se é uma URL de vídeo direto (Supabase, MP4, etc.)
const isDirectVideoUrl = (url: string): boolean => {
  if (!url) return false;

  // URLs do Supabase Storage
  if (url.includes('supabase.co/storage') || url.includes('supabase.com/storage') || url.includes('supabase.io/storage')) {
    return true;
  }

  // Extensões de vídeo direto
  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url)) {
    return true;
  }

  return false;
};

export function VideoPlayer({
  url,
  onProgress,
  onEnded,
  onError,
  autoSaveProgress = true,
  initialTime = 0
}: VideoPlayerProps) {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const reactPlayerRef = useRef<{ seekTo: (amount: number, type?: string) => void } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // Estados
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [seeking, setSeeking] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // Determina o tipo de player a usar
  const useNativePlayer = isDirectVideoUrl(url);

  // Log para debug
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[VideoPlayer] Initializing with URL:', url);
      console.log('[VideoPlayer] Using native player:', useNativePlayer);
    }

    // Reset estados quando URL muda
    mountedRef.current = true;
    setIsReady(false);
    setPlayed(0);
    setLoaded(0);
    setDuration(0);
    setPlaying(false);
    setIsBuffering(false);

    return () => {
      mountedRef.current = false;
    };
  }, [url, useNativePlayer]);

  // Função unificada para seek
  const seekTo = useCallback((seconds: number) => {
    if (!isReady) return;

    if (useNativePlayer && videoRef.current) {
      videoRef.current.currentTime = seconds;
    } else if (reactPlayerRef.current?.seekTo) {
      reactPlayerRef.current.seekTo(seconds, 'seconds');
    }
  }, [useNativePlayer, isReady]);

  // Restaurar tempo inicial
  useEffect(() => {
    if (initialTime > 0 && isReady && duration > 0) {
      seekTo(initialTime);
    }
  }, [initialTime, isReady, duration, seekTo]);

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      hideControlsTimeout.current = setTimeout(() => {
        if (playing) {
          setShowControls(false);
        }
      }, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        if (hideControlsTimeout.current) {
          clearTimeout(hideControlsTimeout.current);
        }
      };
    }
  }, [playing]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isReady) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          setPlaying(!playing);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekTo(Math.max(0, played * duration - 10));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekTo(Math.min(duration, played * duration + 10));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((v) => Math.min(1, v + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 0.1));
          break;
        case 'm':
          e.preventDefault();
          setMuted(!muted);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playing, played, duration, muted, toggleFullscreen, isReady, seekTo]);

  // Handler de progresso para vídeo nativo
  const handleNativeTimeUpdate = useCallback(() => {
    if (!videoRef.current || seeking) return;

    const currentTime = videoRef.current.currentTime;
    const totalDuration = videoRef.current.duration || 0;
    const buffered = videoRef.current.buffered;

    const playedFraction = totalDuration > 0 ? currentTime / totalDuration : 0;
    let loadedFraction = 0;

    if (buffered.length > 0) {
      loadedFraction = totalDuration > 0 ? buffered.end(buffered.length - 1) / totalDuration : 0;
    }

    setPlayed(playedFraction);
    setLoaded(loadedFraction);

    if (onProgress && autoSaveProgress && mountedRef.current) {
      onProgress({
        played: playedFraction,
        playedSeconds: currentTime,
        loaded: loadedFraction,
        loadedSeconds: buffered.length > 0 ? buffered.end(buffered.length - 1) : 0,
      });
    }
  }, [seeking, onProgress, autoSaveProgress]);

  // Handler de progresso para ReactPlayer
  const handleReactPlayerProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    if (!seeking && mountedRef.current) {
      setPlayed(state.played);
      setLoaded(state.loaded);

      if (onProgress && autoSaveProgress) {
        onProgress({
          played: state.played,
          playedSeconds: state.playedSeconds,
          loaded: state.loaded,
          loadedSeconds: state.loadedSeconds,
        });
      }
    }
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekChange = (value: number[]) => {
    if (value[0] !== undefined) {
      setPlayed(value[0] / 100);
    }
  };

  const handleSeekMouseUp = (value: number[]) => {
    setSeeking(false);
    if (value[0] !== undefined && duration > 0) {
      const newTime = (value[0] / 100) * duration;
      seekTo(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (value[0] !== undefined) {
      const newVolume = value[0] / 100;
      setVolume(newVolume);
      setMuted(false);

      if (useNativePlayer && videoRef.current) {
        videoRef.current.volume = newVolume;
        videoRef.current.muted = false;
      }
    }
  };

  const togglePictureInPicture = () => {
    const videoElement = useNativePlayer ? videoRef.current : containerRef.current?.querySelector('video');
    if (videoElement) {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      } else {
        videoElement.requestPictureInPicture();
      }
    }
  };

  const skip = (seconds: number) => {
    if (isReady) {
      const currentTime = played * duration;
      seekTo(Math.max(0, Math.min(duration, currentTime + seconds)));
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds === 0) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Controle de play/pause para vídeo nativo
  useEffect(() => {
    if (useNativePlayer && videoRef.current && isReady) {
      if (playing) {
        videoRef.current.play().catch(err => {
          console.error('[VideoPlayer] Play error:', err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [playing, useNativePlayer, isReady]);

  // Controle de volume para vídeo nativo
  useEffect(() => {
    if (useNativePlayer && videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = muted;
    }
  }, [volume, muted, useNativePlayer]);

  // Controle de playback rate para vídeo nativo
  useEffect(() => {
    if (useNativePlayer && videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, useNativePlayer]);

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black rounded-lg overflow-hidden group',
        fullscreen && 'fixed inset-0 z-50 rounded-none'
      )}
      style={{ aspectRatio: fullscreen ? 'auto' : '16/9' }}
    >
      {/* Player de Vídeo */}
      {useNativePlayer ? (
        <video
          ref={videoRef}
          src={url}
          className="w-full h-full object-contain"
          playsInline
          preload="metadata"
          onLoadedMetadata={() => {
            if (videoRef.current && mountedRef.current) {
              setDuration(videoRef.current.duration);
              setIsReady(true);
              if (process.env.NODE_ENV === 'development') {
                console.log('[VideoPlayer] Native video ready, duration:', videoRef.current.duration);
              }
            }
          }}
          onCanPlay={() => {
            if (mountedRef.current) {
              setIsBuffering(false);
            }
          }}
          onWaiting={() => {
            if (mountedRef.current) {
              setIsBuffering(true);
            }
          }}
          onPlaying={() => {
            if (mountedRef.current) {
              setIsBuffering(false);
            }
          }}
          onTimeUpdate={handleNativeTimeUpdate}
          onEnded={() => {
            if (mountedRef.current) {
              setPlaying(false);
              onEnded?.();
            }
          }}
          onError={(e) => {
            console.error('[VideoPlayer] Native video error:', e);
            if (mountedRef.current) {
              onError?.();
            }
          }}
        />
      ) : (
        React.createElement(ReactPlayer as React.ComponentType<Record<string, unknown>>, {
          ref: reactPlayerRef,
          url,
          playing,
          volume,
          muted,
          playbackRate,
          width: "100%",
          height: "100%",
          onProgress: handleReactPlayerProgress,
          onDuration: (dur: number) => {
            if (mountedRef.current) {
              setDuration(dur);
              if (process.env.NODE_ENV === 'development') {
                console.log('[VideoPlayer] ReactPlayer duration loaded:', dur);
              }
            }
          },
          onReady: () => {
            if (mountedRef.current) {
              setIsReady(true);
              setIsBuffering(false);
              if (process.env.NODE_ENV === 'development') {
                console.log('[VideoPlayer] ReactPlayer ready');
              }
            }
          },
          onBuffer: () => {
            if (mountedRef.current) {
              setIsBuffering(true);
            }
          },
          onBufferEnd: () => {
            if (mountedRef.current) {
              setIsBuffering(false);
            }
          },
          onEnded: () => {
            if (mountedRef.current) {
              setPlaying(false);
              onEnded?.();
            }
          },
          onError: (e: unknown, data?: unknown) => {
            console.error('[VideoPlayer] ReactPlayer error:', e, data);
            if (mountedRef.current) {
              onError?.();
            }
          },
          config: {
            youtube: {
              playerVars: {
                rel: 0,
                controls: 0,
                modestbranding: 1,
              },
            },
            file: {
              forceVideo: true,
              attributes: {
                controlsList: 'nodownload',
                playsInline: true,
              },
            },
          },
        })
      )}

      {/* Loading Overlay */}
      {(!isReady || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <span className="text-white text-sm">
              {isBuffering ? 'A carregar...' : 'A preparar vídeo...'}
            </span>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300',
          showControls || !playing ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Progress Bar */}
        <div className="mb-3 space-y-1">
          <Slider
            value={[played * 100]}
            max={100}
            step={0.1}
            onValueChange={handleSeekChange}
            onPointerDown={handleSeekMouseDown}
            onPointerUp={(e: React.PointerEvent<HTMLSpanElement>) => {
              const target = e.currentTarget as HTMLElement;
              const rect = target.getBoundingClientRect();
              const percent = ((e.clientX - rect.left) / rect.width) * 100;
              handleSeekMouseUp([percent]);
            }}
            className="cursor-pointer"
          />
          {/* Loaded Progress */}
          <div className="relative h-1 -mt-2 pointer-events-none">
            <div
              className="absolute h-full bg-white/30 rounded-full"
              style={{ width: `${loaded * 100}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 text-white hover:bg-white/20"
              onClick={() => setPlaying(!playing)}
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            {/* Skip Backward */}
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-white hover:bg-white/20"
              onClick={() => skip(-10)}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            {/* Skip Forward */}
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-white hover:bg-white/20"
              onClick={() => skip(10)}
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-white hover:bg-white/20"
                onClick={() => setMuted(!muted)}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <div className="w-0 group-hover/volume:w-20 transition-all duration-200 overflow-hidden">
                <Slider
                  value={[muted ? 0 : volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>

            {/* Time */}
            <div className="text-white text-sm font-medium ml-2">
              {formatTime(played * duration)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Settings (Playback Speed) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Velocidade de Reprodução</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {playbackRates.map((rate) => (
                  <DropdownMenuItem
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={cn(playbackRate === rate && 'bg-primary/10')}
                  >
                    {rate === 1 ? 'Normal' : `${rate}x`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Picture in Picture */}
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-white hover:bg-white/20"
              onClick={togglePictureInPicture}
            >
              <PictureInPicture className="h-4 w-4" />
            </Button>

            {/* Fullscreen */}
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              {fullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="text-white/60 text-xs mt-2 text-center">
          Atalhos: Espaço (Play/Pause) • ← → (10s) • ↑ ↓ (Volume) • F (Tela cheia) • M (Mudo)
        </div>
      </div>
    </div>
  );
}
