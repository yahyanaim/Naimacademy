"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Copy, X } from "lucide-react";

export default function TranslateSelection() {
  const [selection, setSelection] = useState<{
    text: string;
    rect: DOMRect;
  } | null>(null);
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const translateToArabic = useCallback(async (text: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ar`
      );
      const data = await response.json();
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        setTranslatedText(data.responseData.translatedText);
        setShowTranslation(true);
      }
    } catch {
      setTranslatedText("Translation failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      setSelection(null);
      setShowTranslation(false);
      return;
    }

    const text = sel.toString().trim();
    if (text.length < 2 || text.length > 500) {
      setSelection(null);
      setShowTranslation(false);
      return;
    }

    const range = sel.getRangeAt(0);
    
    let element: Node | null = range.commonAncestorContainer;
    while (element && element.nodeType !== Node.ELEMENT_NODE) {
      element = element.parentNode;
    }
    
    if (!element) return;
    
    const pElement = element as HTMLElement;
    const rect = pElement.getBoundingClientRect();
    
    setSelection({ text, rect });
    translateToArabic(text);
  }, [translateToArabic]);

  const copyTranslation = () => {
    navigator.clipboard.writeText(translatedText);
  };

  const closeTranslation = () => {
    setShowTranslation(false);
    setSelection(null);
    setTranslatedText("");
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection);
    
    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("touchend", handleSelection);
    };
  }, [handleSelection]);

  if (!selection || !showTranslation) return null;

  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-900 rounded-lg shadow-xl border p-3 w-80"
      style={{ 
        top: `${selection.rect.bottom + window.scrollY + 15}px`, 
        left: `${Math.max(16, selection.rect.left + window.scrollX)}px`,
        maxWidth: Math.min(selection.rect.width, 400)
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">
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
          <button
            onClick={() => translateToArabic(selection.text)}
            className="flex-1 bg-muted hover:bg-muted/80 py-1.5 rounded-md text-xs font-medium transition-colors"
          >
            Translate Again
          </button>
        </div>
      )}
    </div>
  );
}
