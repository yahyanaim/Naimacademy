"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, Pause, Play, X, Gauge } from "lucide-react";

interface ListenButtonProps {
  content: string;
  title: string;
}

export default function ListenButton({ content, title }: ListenButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const totalCharsRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechSupported(false);
    }
  }, []);

  const stripMarkdown = useCallback((text: string): string => {
    let clean = text;
    clean = clean.replace(/```[\s\S]*?```/g, " code section ");
    clean = clean.replace(/^#{1,6}\s+/gm, "");
    clean = clean.replace(/\*\*(.*?)\*\*/g, "$1");
    clean = clean.replace(/\*(.*?)\*/g, "$1");
    clean = clean.replace(/`([^`]+)`/g, "$1");
    clean = clean.replace(/^\*\s+/gm, "");
    clean = clean.replace(/^\d+\.\s+/gm, "");
    clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    clean = clean.replace(/<[^>]+>/g, "");
    clean = clean.replace(/\n+/g, " ");
    clean = clean.replace(/\s+/g, " ").trim();
    return clean;
  }, []);

  const stopSpeech = useCallback(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsPlaying(false);
    setProgress(0);
    utteranceRef.current = null;
  }, []);

  const speak = useCallback(() => {
    if (!speechSupported || typeof window === "undefined") return;

    const synth = window.speechSynthesis;

    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
      return;
    }

    if (synth.paused) {
      synth.resume();
      setIsPlaying(true);
      return;
    }

    synth.cancel();

    const text = `${title}. ${stripMarkdown(content)}`;
    totalCharsRef.current = text.length;

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    const selectedVoice = synth.getVoices().find(v => 
      v.lang.startsWith("en")
    ) || synth.getVoices()[0];
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = speed;
    utterance.pitch = 1.1;
    utterance.volume = volume;

    utterance.onboundary = (event) => {
      if (event.name === "word" && totalCharsRef.current > 0) {
        const currentProgress = Math.min(100, (event.charIndex / totalCharsRef.current) * 100);
        setProgress(currentProgress);
      }
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      utteranceRef.current = null;
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };
    
    synth.speak(utterance);
    setIsPlaying(true);
    setShowControls(true);
  }, [content, title, isPlaying, speechSupported, speed, volume, stripMarkdown]);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (utteranceRef.current) {
      utteranceRef.current.rate = newSpeed;
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (utteranceRef.current) {
      utteranceRef.current.volume = newVolume;
    }
  };

  const closeControls = () => {
    stopSpeech();
    setShowControls(false);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  if (!speechSupported) return null;

  return (
    <>
      <button
        onClick={speak}
        className="group relative p-1.5 rounded-full hover:bg-muted transition-colors"
        title={isPlaying ? "Pause" : "Listen"}
      >
        {isPlaying ? (
          <Pause className="size-4 text-primary" />
        ) : (
          <Volume2 className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
        {isPlaying && (
          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
        )}
      </button>

      {showControls && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#1a1a2e] border border-gray-700/50 rounded-2xl shadow-2xl p-4 w-72">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400">Audio Player</span>
            <button onClick={closeControls} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <X className="size-3" />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={speak}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
            </button>
            <div className="flex-1">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white/80 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 mt-1">{Math.round(progress)}%</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleVolumeChange(Math.max(0, volume - 0.25))}
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <Volume2 className="size-3" />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white/80"
              style={{ accentColor: 'rgba(255,255,255,0.8)' }}
            />
            <span className="text-[10px] text-gray-500 w-8">{Math.round(volume * 100)}%</span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <span className="text-[10px] text-gray-500">Speed</span>
            <div className="flex gap-1">
              {[0.75, 1, 1.25, 1.5].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                    speed === s
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}