"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface ListenButtonProps {
  content: string;
  title: string;
}

export default function ListenButton({ content, title }: ListenButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechSupported(false);
    }
  }, []);

  const stripMarkdown = (text: string): string => {
    let clean = text;
    clean = clean.replace(/^#{1,6}\s+/gm, "");
    clean = clean.replace(/\*\*(.*?)\*\*/g, "$1");
    clean = clean.replace(/\*(.*?)\*/g, "$1");
    clean = clean.replace(/`([^`]+)`/g, "$1");
    clean = clean.replace(/^\*\s+/gm, "");
    clean = clean.replace(/^\d+\.\s+/gm, "");
    clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    clean = clean.replace(/\n+/g, " ");
    clean = clean.replace(/\s+/g, " ").trim();
    return clean;
  };

  const stopSpeech = useCallback(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsPlaying(false);
    utteranceRef.current = null;
  }, []);

  const speak = useCallback(() => {
    if (!speechSupported || typeof window === "undefined") return;

    const synth = window.speechSynthesis;
    
    if (isPlaying) {
      stopSpeech();
      return;
    }

    synth.cancel();

    const text = `${title}. ${stripMarkdown(content)}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    const selectedVoice = synth.getVoices().find(v => 
      v.lang === "en-US" && !v.name.toLowerCase().includes("david") && !v.name.toLowerCase().includes("mark")
    ) || synth.getVoices().find(v => v.lang.startsWith("en"));
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    
    utterance.onend = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };
    
    synth.speak(utterance);
    setIsPlaying(true);
  }, [content, title, isPlaying, speechSupported, stopSpeech]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  if (!speechSupported) return null;

  return (
    <button
      onClick={speak}
      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
        isPlaying
          ? "bg-primary text-primary-foreground"
          : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
      }`}
      title={isPlaying ? "Stop listening" : "Listen to article"}
    >
      {isPlaying ? (
        <VolumeX className="size-3" />
      ) : (
        <Volume2 className="size-3" />
      )}
      <span className="hidden sm:inline">{isPlaying ? "Stop" : "Listen"}</span>
    </button>
  );
}
