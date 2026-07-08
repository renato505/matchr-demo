"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionAlternativeLike = {
  transcript: string;
  confidence: number;
};

type SpeechRecognitionResultLike = {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternativeLike;
  [index: number]: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionEventLike = {
  readonly resultIndex: number;
  readonly results: {
    readonly length: number;
    item(index: number): SpeechRecognitionResultLike;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionErrorEventLike = {
  error: string;
  message?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export type UseSpeechToTextOptions = {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
};

export function useSpeechToText({
  language = "pt-BR",
  continuous = false,
  interimResults = true,
}: UseSpeechToTextOptions = {}) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));

    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setConfidence(null);
    setError(null);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const start = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setError("Este navegador não oferece reconhecimento de voz nativo. Use o campo de texto como fallback.");
      setIsSupported(false);
      return;
    }

    recognitionRef.current?.abort();

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setError(null);
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognition.onerror = (event) => {
      setError(event.message || `Erro no reconhecimento de voz: ${event.error}`);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      let lastConfidence: number | null = null;

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const alternative = result[0] || result.item(0);
        if (!alternative) continue;

        if (result.isFinal) {
          finalText += alternative.transcript;
          lastConfidence = alternative.confidence;
        } else {
          interimText += alternative.transcript;
        }
      }

      if (finalText.trim()) {
        setTranscript((previous) => `${previous} ${finalText}`.trim());
      }
      setInterimTranscript(interimText.trim());
      setConfidence(lastConfidence);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [continuous, interimResults, language]);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    confidence,
    error,
    start,
    stop,
    reset,
    setTranscript,
  };
}
