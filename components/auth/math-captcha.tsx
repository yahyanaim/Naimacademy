"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MathCaptchaProps {
  onVerify: (valid: boolean) => void;
}

export function MathCaptcha({ onVerify }: MathCaptchaProps) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    generate();
  }, []);

  function generate() {
    setA(Math.floor(Math.random() * 10) + 1);
    setB(Math.floor(Math.random() * 10) + 1);
    setAnswer("");
    onVerify(false);
  }

  function handleChange(value: string) {
    setAnswer(value);
    const correct = value === String(a + b);
    onVerify(correct);
  }

  return (
    <div className="space-y-2">
      <Label>Security Check</Label>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-4 py-2.5 text-sm font-mono select-none min-w-[120px] justify-center">
          <span>{a}</span>
          <span>+</span>
          <span>{b}</span>
          <span>=</span>
          <span>?</span>
        </div>
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Answer"
          value={answer}
          onChange={(e) => handleChange(e.target.value)}
          className="w-24 h-11"
        />
        <button
          type="button"
          onClick={generate}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors p-2"
          title="New challenge"
        >
          &#x21bb;
        </button>
      </div>
    </div>
  );
}
