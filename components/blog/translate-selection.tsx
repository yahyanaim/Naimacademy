"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Languages, Copy, X } from "lucide-react";

export default function TranslateSelection() {
  const [showPopup, setShowPopup] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setShowPopup(false);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 2 || text.length > 500) {
      setShowPopup(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    setPosition({
      top: rect.bottom + window.scrollY + 10,
      left: rect.left + window.scrollX + (rect.width / 2) - 75,
    });
    setSelectedText(text);
    setTranslatedText("");
    setShowPopup(true);
  }, []);

  const translateToArabic = async () => {
    if (!selectedText) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(selectedText)}&langpair=en|ar`
      );
      const data = await response.json();
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        setTranslatedText(data.responseData.translatedText);
      } else {
        setTranslatedText("Translation failed. Please try again.");
      }
    } catch (error) {
      setTranslatedText("Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyTranslation = () => {
    navigator.clipboard.writeText(translatedText);
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection);
    
    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("touchend", handleSelection);
    };
  }, [handleSelection]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowPopup(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!showPopup) return null;

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-white dark:bg-gray-900 rounded-lg shadow-xl border p-3 w-80 animate-in fade-in zoom-in duration-200"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Languages className="size-3" />
          Translate to Arabic
        </span>
        <button
          onClick={() => setShowPopup(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-3" />
        </button>
      </div>
      
      {!translatedText ? (
        <>
          <p className="text-sm mb-2 line-clamp-2 text-foreground">{selectedText}</p>
          <button
            onClick={translateToArabic}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Translating..." : "Translate to Arabic"}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm mb-2 line-clamp-2 text-muted-foreground">{selectedText}</p>
          <div className="bg-muted rounded-md p-2 mb-2">
            <p className="text-sm text-foreground font-medium text-right" dir="rtl">
              {translatedText}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyTranslation}
              className="flex-1 flex items-center justify-center gap-1 bg-muted hover:bg-muted/80 py-2 rounded-md text-xs font-medium transition-colors"
            >
              <Copy className="size-3" />
              Copy
            </button>
            <button
              onClick={() => setTranslatedText("")}
              className="flex-1 bg-muted hover:bg-muted/80 py-2 rounded-md text-xs font-medium transition-colors"
            >
              Translate Again
            </button>
          </div>
        </>
      )}
    </div>
  );
}
