"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, Pause, Play, X } from "lucide-react";

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
  const [isReady, setIsReady] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const totalCharsRef = useRef(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechSupported(false);
      return;
    }
    
    const synth = window.speechSynthesis;
    synthRef.current = synth;

    const loadVoices = () => {
      setIsReady(true);
    };

    if (synth.getVoices().length > 0) {
      setIsReady(true);
    } else {
      synth.addEventListener("voiceschanged", loadVoices);
      return () => synth.removeEventListener("voiceschanged", loadVoices);
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
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsPlaying(false);
    setProgress(0);
    utteranceRef.current = null;
  }, []);

  const speak = useCallback(() => {
    if (!speechSupported || !synthRef.current) return;

    const synth = synthRef.current;

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

    const text = `${title}. ${stripMarkdown(content)}`;
    totalCharsRef.current = text.length;

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    const voices = synth.getVoices();
    const selectedVoice = voices.find(v => v.lang.startsWith("en")) || voices[0];
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = speed;
    utterance.pitch = 1.1;
    utterance.volume = volume;

    let lastIndex = 0;
    utterance.onboundary = (event) => {
      if (event.name === "word" && totalCharsRef.current > 0) {
        lastIndex = event.charIndex;
        const currentProgress = Math.min(99, (lastIndex / totalCharsRef.current) * 100);
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
      synthRef.current?.cancel();
    };
  }, []);

  if (!speechSupported) return null;

  return (
    <>
      <button
        onClick={speak}
        className="relative p-1.5 rounded-full hover:bg-muted transition-colors"
        title={isPlaying ? "Pause" : "Listen"}
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
            <button onClick={speak} className="text-primary hover:text-primary/80 transition-colors">
              {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
            </button>

            <div className="w-20 h-1 bg-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
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
                className="w-10 h-1 bg-border rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="flex items-center gap-0.5">
              {[1, 1.25, 1.5].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                    speed === s
                      ? "bg-primary text-primary-foreground"
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

          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a2e] px-4 py-2 flex items-center gap-3">
            <button onClick={speak} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <div className="flex-1 h-0.5 bg-white/10 rounded-full">
              <div className="h-full bg-white/60 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <button onClick={closeControls} className="text-gray-400">
              <X className="size-4" />
            </button>
          </div>
        </>
      )}
    </>
  );
}