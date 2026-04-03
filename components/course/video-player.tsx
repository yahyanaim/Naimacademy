"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically imported to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface VideoPlayerProps {
  url: string;
  onProgress?: (timestamp: number) => void;
  onPause?: () => void;
  initialTimestamp?: number;
}

const PLAYBACK_RATES = [0.5, 1, 1.25, 1.5, 2];

export function VideoPlayer({ url, onProgress, onPause, initialTimestamp = 0 }: VideoPlayerProps) {
  const [playbackRate, setPlaybackRate] = useState(1);
  const [ready, setReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // After the player renders, grab the underlying <video> element for direct control
  useEffect(() => {
    if (!ready || !containerRef.current) return;
    const video = containerRef.current.querySelector("video");
    if (!video) return;
    videoRef.current = video;

    if (initialTimestamp > 0) {
      video.currentTime = initialTimestamp;
    }

    const handleTimeUpdate = () => {
      onProgress?.(video.currentTime);
    };

    const handlePause = () => {
      onPause?.();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("pause", handlePause);
    };
  }, [ready, initialTimestamp, onProgress, onPause]);

  return (
    <div className="flex flex-col gap-2">
      <div ref={containerRef} className="aspect-video bg-black rounded-lg overflow-hidden">
        <ReactPlayer
          src={url}
          width="100%"
          height="100%"
          controls={true}
          playing={true}
          playbackRate={playbackRate}
          onReady={() => setReady(true)}
        />
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-2">Speed:</span>
        {PLAYBACK_RATES.map((rate) => (
          <button
            key={rate}
            onClick={() => {
              setPlaybackRate(rate);
              if (videoRef.current) {
                videoRef.current.playbackRate = rate;
              }
            }}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              playbackRate === rate
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {rate}x
          </button>
        ))}
      </div>
    </div>
  );
}
