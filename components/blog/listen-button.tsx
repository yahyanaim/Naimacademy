"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, Pause, Play, X } from "lucide-react";

interface ListenButtonProps {
  content: string;
  title: string;
}

export default function ListenButton({ content, title }: ListenButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const totalCharsRef = useRef(0);
  const synthRef = useRef<globalThis.SpeechSynthesis | null>(null);
  const contentRef = useRef(content);
  const titleRef = useRef(title);

  useEffect(() => {
    contentRef.current = content;
    titleRef.current = title;
  }, [content, title]);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      setSpeechSupported(true);
      window.speechSynthesis.getVoices();
    }
  }, []);

  const stripMarkdown = (text: string): string => {
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
  };

  const stopSpeech = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setProgress(0);
    utteranceRef.current = null;
  }, []);

  const togglePlay = useCallback(() => {
    const synth = synthRef.current;
    if (!synth) return;

    if (synth.paused) {
      synth.resume();
      setIsPlaying(true);
      return;
    }

    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
      return;
    }

    synth.cancel();

    const text = `${titleRef.current}. ${stripMarkdown(contentRef.current)}`;
    totalCharsRef.current = text.length;

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    const voices = synth.getVoices();
    const preferredVoice = voices.find(v => v.lang === "en-US") || 
                           voices.find(v => v.lang.startsWith("en")) || 
                           voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = speed;
    utterance.pitch = 1.1;
    utterance.volume = volume;

    let lastProgress = 0;
    utterance.onboundary = (event) => {
      if (event.name === "word" && totalCharsRef.current > 0) {
        lastProgress = Math.min(98, (event.charIndex / totalCharsRef.current) * 100);
        setProgress(lastProgress);
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
  }, [isPlaying, speed, volume]);

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
      synthRef.current?.cancel();
    };
  }, []);

  if (!speechSupported) return null;

  return (
    <>
      <button
        onClick={togglePlay}
        className="relative p-1.5 rounded-full hover:bg-muted transition-colors"
        title={isPlaying ? "Pause" : "Listen to article"}
      >
        {isPlaying ? (
          <Pause className="size-4 text-primary" />
        ) : (
          <Volume2 className="size-4 text-muted-foreground hover:text-foreground" />
        )}
      </button>

      {showControls && (
        <>
          <div className="hidden md:flex items-center gap-2 bg-muted rounded-full px-3 py-1.5">
            <button onClick={togglePlay} className="text-muted-foreground hover:text-foreground transition-colors">
              {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
            </button>

            <div className="w-20 h-1 bg-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-foreground/40 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center gap-1">
              <Volume2 className="size-3 text-muted-foreground" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-10 h-1 bg-border rounded-full appearance-none cursor-pointer accent-foreground/40"
              />
            </div>

            <div className="flex items-center gap-0.5">
              {[0.75, 1, 1.25, 1.5].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                    speed === s
                      ? "bg-foreground/20 text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <button onClick={closeControls} className="p-1 rounded-full hover:bg-background text-muted-foreground hover:text-foreground transition-colors">
              <X className="size-3" />
            </button>
          </div>

          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#2a2a2a] border-t border-gray-700/50 shadow-2xl px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white shrink-0">
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
              </button>

              <div className="flex-1">
                <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleVolumeChange(Math.max(0, volume - 0.2))} className="text-gray-400 p-1">
                  <Volume2 className="size-4" />
                </button>
                <span className="text-xs text-gray-400 w-8">{Math.round(volume * 100)}%</span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {[1, 1.25, 1.5].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`px-2 py-1 text-xs rounded ${
                      speed === s
                        ? "bg-gray-600 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <button onClick={closeControls} className="text-gray-400 p-1 shrink-0">
                <X className="size-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}