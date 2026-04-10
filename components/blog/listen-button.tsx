"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface ListenButtonProps {
  content: string;
  title: string;
}

export default function ListenButton({ content, title }: ListenButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

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

  const speak = () => {
    if (!speechSupported) return;

    const synth = window.speechSynthesis;
    
    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      return;
    }

    const text = `${title}. ${stripMarkdown(content)}`;
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = synth.getVoices();
    const maleVoice = voices.find(v => 
      v.lang.startsWith("en") && 
      (v.name.toLowerCase().includes("male") || 
       v.name.toLowerCase().includes("daniel") ||
       v.name.toLowerCase().includes("david") ||
       v.name.toLowerCase().includes("alex") ||
       v.name.toLowerCase().includes("mark") ||
       v.name.toLowerCase().includes("tom") ||
       v.name.toLowerCase().includes("fred") ||
       v.name.toLowerCase().includes("ralph") ||
       v.name.toLowerCase().includes("kyle") ||
       v.name.toLowerCase().includes("james") ||
       v.name.toLowerCase().includes("john") ||
       v.name.toLowerCase().includes("michael") ||
       v.name.toLowerCase().includes("will") ||
       v.name.toLowerCase().includes("ben") ||
       v.name.includes("Google UK English Male") ||
       v.name.includes("Microsoft David") ||
       v.name.includes("Microsoft Mark") ||
       v.name.includes("Samantha") === false)
    ) || voices.find(v => v.lang.startsWith("en"));
    
    if (maleVoice) {
      utterance.voice = maleVoice;
    }
    
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    synth.cancel();
    synth.speak(utterance);
    setIsPlaying(true);
  };

  if (!speechSupported) return null;

  return (
    <button
      onClick={speak}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        isPlaying
          ? "bg-primary text-primary-foreground"
          : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
      }`}
      title={isPlaying ? "Stop listening" : "Listen to article"}
    >
      {isPlaying ? (
        <>
          <VolumeX className="size-4" />
          Stop
        </>
      ) : (
        <>
          <Volume2 className="size-4" />
          Listen
        </>
      )}
    </button>
  );
}
