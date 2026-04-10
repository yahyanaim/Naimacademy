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
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechSupported(false);
      return;
    }

    const synth = window.speechSynthesis;
    
    const loadVoices = () => {
      setVoicesLoaded(synth.getVoices().length > 0);
    };

    loadVoices();
    synth.addEventListener("voiceschanged", loadVoices);

    return () => {
      synth.removeEventListener("voiceschanged", loadVoices);
    };
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
    
    let voices = synth.getVoices();
    
    if (voices.length === 0) {
      voices = new Promise<SpeechSynthesisVoice[]>(resolve => {
        synth.addEventListener("voiceschanged", () => resolve(synth.getVoices()), { once: true });
      }) as unknown as SpeechSynthesisVoice[];
    }

    const maleNames = ["daniel", "david", "alex", "mark", "tom", "fred", "ralph", "kyle", "james", "john", "michael", "will", "ben", "george", "harry", "bob", "rick", "paul", "steve"];
    
    const selectVoice = (availableVoices: SpeechSynthesisVoice[]) => {
      let maleVoice = availableVoices.find(v => 
        v.lang.startsWith("en") && 
        maleNames.some(name => v.name.toLowerCase().includes(name))
      );
      
      if (!maleVoice) {
        maleVoice = availableVoices.find(v => 
          v.lang === "en-US" && 
          !v.name.toLowerCase().includes("female") &&
          !v.name.toLowerCase().includes("samantha") &&
          !v.name.toLowerCase().includes("victoria") &&
          !v.name.toLowerCase().includes("karen") &&
          !v.name.toLowerCase().includes("zira")
        );
      }
      
      if (!maleVoice) {
        maleVoice = availableVoices.find(v => v.lang.startsWith("en"));
      }
      
      return maleVoice;
    };

    const availableVoices = Array.isArray(voices) ? voices : [];
    const selectedVoice = selectVoice(availableVoices);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onend = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };
    
    setTimeout(() => {
      synth.speak(utterance);
      setIsPlaying(true);
    }, 100);
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
