"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Copy, X, Move } from "lucide-react";

export default function TranslateSelection() {
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  const translateToArabic = useCallback(async (text: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ar`
      );
      const data = await response.json();
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        setTranslatedText(data.responseData.translatedText);
        setShowPopup(true);
      }
    } catch {
      setTranslatedText("Translation failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;

    const text = sel.toString().trim();
    if (text.length < 2 || text.length > 500) return;

    translateToArabic(text);
  }, [translateToArabic]);

  const copyTranslation = () => {
    navigator.clipboard.writeText(translatedText);
  };

  const closeTranslation = () => {
    setShowPopup(false);
    setTranslatedText("");
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.startPosX + dx,
        y: dragRef.current.startPosY + dy,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection);
    
    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("touchend", handleSelection);
    };
  }, [handleSelection]);

  if (!showPopup) return null;

  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-900 rounded-lg shadow-xl border p-3 w-80 cursor-move"
      style={{ 
        top: `${position.y}px`, 
        left: `${position.x}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Move className="size-3 cursor-move" />
          Translation (Arabic)
        </span>
        <button
          onClick={closeTranslation}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-3" />
        </button>
      </div>
      
      <div className="bg-muted/50 rounded-md p-2 mb-2">
        <p className="text-sm text-foreground font-medium text-right" dir="rtl" lang="ar">
          {loading ? "Translating..." : translatedText}
        </p>
      </div>
      
      {!loading && (
        <div className="flex gap-2">
          <button
            onClick={copyTranslation}
            className="flex-1 flex items-center justify-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90 py-1.5 rounded-md text-xs font-medium transition-colors"
          >
            <Copy className="size-3" />
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
