"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, VolumeX, Pause, Play, X } from "lucide-react";

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
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
          isPlaying
            ? "bg-primary text-primary-foreground"
            : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
        }`}
        title={isPlaying ? "Pause listening" : "Listen to article"}
      >
        {isPlaying ? (
          <Pause className="size-3" />
        ) : (
          <Volume2 className="size-3" />
        )}
        <span className="hidden sm:inline">{isPlaying ? "Pause" : "Listen"}</span>
      </button>

      {showControls && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1e1e2e] border-t border-gray-700/50 shadow-2xl">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={speak}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-colors shrink-0"
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-gray-400 w-12">Progress</span>
                  <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#3b82f6] rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">{Math.round(progress)}%</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleVolumeChange(Math.max(0, volume - 0.2))}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <VolumeX className="size-4" />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-[#3b82f6]"
                  />
                  <button
                    onClick={() => handleVolumeChange(Math.min(1, volume + 0.2))}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Volume2 className="size-4" />
                  </button>
                  <span className="text-xs text-gray-400 w-12">{Math.round(volume * 100)}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400">Speed:</span>
                <div className="flex gap-1">
                  {[0.5, 0.75, 1, 1.25, 1.5].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className={`px-2 py-0.5 text-xs rounded transition-colors ${
                        speed === s
                          ? "bg-[#3b82f6] text-white"
                          : "bg-gray-700 text-gray-400 hover:text-white"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={closeControls}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600 transition-colors shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}