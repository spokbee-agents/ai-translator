"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, ChevronDown, Languages } from "lucide-react";

const LANGUAGES = [
  { code: "en-US", name: "English", short: "EN" },
  { code: "es-ES", name: "Spanish", short: "ES" },
  { code: "fr-FR", name: "French", short: "FR" },
  { code: "de-DE", name: "German", short: "DE" },
  { code: "it-IT", name: "Italian", short: "IT" },
  { code: "pt-BR", name: "Portuguese", short: "PT" },
  { code: "zh-CN", name: "Chinese", short: "ZH" },
  { code: "ja-JP", name: "Japanese", short: "JA" },
  { code: "ko-KR", name: "Korean", short: "KO" },
  { code: "ar-SA", name: "Arabic", short: "AR" },
  { code: "ru-RU", name: "Russian", short: "RU" },
  { code: "hi-IN", name: "Hindi", short: "HI" },
];

function getLangName(code: string) {
  return LANGUAGES.find((l) => l.code === code)?.name ?? code;
}

function getSpeechLangCode(code: string) {
  // SpeechSynthesis uses BCP 47 codes like "en-US"
  return code;
}

interface HalfProps {
  side: "them" | "you";
  lang: string;
  onLangChange: (code: string) => void;
  isListening: boolean;
  onToggleListen: () => void;
  interimText: string;
  finalText: string;
  translatedText: string;
  sttSupported: boolean;
}

function LanguageSelector({
  lang,
  onLangChange,
  flipped,
}: {
  lang: string;
  onLangChange: (code: string) => void;
  flipped: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="glass glass-hover flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-white/80 transition-all"
      >
        <Languages size={16} className="opacity-50" />
        {getLangName(lang)}
        <ChevronDown
          size={14}
          className={`opacity-40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: flipped ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${flipped ? "bottom-full mb-2" : "top-full mt-2"} left-0 z-50 glass rounded-2xl p-2 min-w-[180px] max-h-[240px] overflow-y-auto hide-scrollbar`}
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  onLangChange(l.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                  lang === l.code
                    ? "bg-[var(--accent-blue)] text-white"
                    : "text-white/70 hover:bg-white/5"
                }`}
              >
                {l.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WaveformDots({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 h-6">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-[var(--accent-blue)]"
          animate={
            active
              ? {
                  height: [4, 16, 8, 20, 4],
                  opacity: [0.4, 1, 0.6, 1, 0.4],
                }
              : { height: 4, opacity: 0.2 }
          }
          transition={
            active
              ? {
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}

function TranslatorHalf({
  side,
  lang,
  onLangChange,
  isListening,
  onToggleListen,
  interimText,
  finalText,
  translatedText,
  sttSupported,
}: HalfProps) {
  const isFlipped = side === "them";

  return (
    <div
      className={`relative flex flex-col flex-1 px-5 py-4 ${
        isFlipped ? "rotate-180 border-b border-white/[0.06]" : ""
      }`}
    >
      {/* Language selector */}
      <div className="flex items-center justify-between mb-3">
        <LanguageSelector
          lang={lang}
          onLangChange={onLangChange}
          flipped={isFlipped}
        />
        <span className="text-[11px] font-medium uppercase tracking-widest text-white/25">
          {side === "them" ? "Them" : "You"}
        </span>
      </div>

      {/* Text area */}
      <div className="flex-1 flex flex-col justify-center items-center text-center overflow-y-auto hide-scrollbar min-h-0">
        {translatedText && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-semibold leading-relaxed text-white mb-2"
          >
            {translatedText}
          </motion.p>
        )}
        {(interimText || finalText) && (
          <p className="text-sm text-white/40 leading-relaxed">
            {finalText}
            {interimText && (
              <span className="text-white/25 italic"> {interimText}</span>
            )}
          </p>
        )}
        {!translatedText && !interimText && !finalText && (
          <p className="text-sm text-white/20">
            {sttSupported
              ? `Tap mic to listen in ${getLangName(lang)}`
              : "Speech recognition not supported"}
          </p>
        )}
      </div>

      {/* Mic button + waveform */}
      <div className="flex flex-col items-center gap-3 mt-3">
        <WaveformDots active={isListening} />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onToggleListen}
          disabled={!sttSupported}
          className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all ${
            isListening
              ? "bg-[var(--accent-blue)] listening-glow"
              : "glass glass-hover"
          } ${!sttSupported ? "opacity-30 cursor-not-allowed" : ""}`}
        >
          {isListening ? (
            <MicOff size={24} className="text-white" />
          ) : (
            <Mic size={24} className="text-white/70" />
          )}
        </motion.button>
        <span className="text-[11px] text-white/30 font-medium">
          {isListening ? "Listening…" : sttSupported ? `Listen ${getLangName(lang)}` : "Unavailable"}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const [themLang, setThemLang] = useState("es-ES");
  const [youLang, setYouLang] = useState("en-US");

  const [themListening, setThemListening] = useState(false);
  const [youListening, setYouListening] = useState(false);

  const [themInterim, setThemInterim] = useState("");
  const [youInterim, setYouInterim] = useState("");

  const [themFinal, setThemFinal] = useState("");
  const [youFinal, setYouFinal] = useState("");

  const [themTranslated, setThemTranslated] = useState("");
  const [youTranslated, setYouTranslated] = useState("");

  const [sttSupported, setSttSupported] = useState(true);

  const themRecogRef = useRef<SpeechRecognition | null>(null);
  const youRecogRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SR =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;
    if (!SR) setSttSupported(false);
  }, []);

  const translate = useCallback(
    async (text: string, sourceLang: string, targetLang: string) => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            sourceLang: getLangName(sourceLang),
            targetLang: getLangName(targetLang),
          }),
        });
        const data = await res.json();
        return data.translatedText as string;
      } catch {
        return null;
      }
    },
    []
  );

  const speak = useCallback((text: string, langCode: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechLangCode(langCode);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, []);

  const startRecognition = useCallback(
    (
      side: "them" | "you",
      lang: string,
      targetLang: string,
      setInterim: React.Dispatch<React.SetStateAction<string>>,
      setFinal: React.Dispatch<React.SetStateAction<string>>,
      setTranslated: React.Dispatch<React.SetStateAction<string>>,
      recogRef: React.RefObject<SpeechRecognition | null>
    ) => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return;

      // Stop existing
      if (recogRef.current) {
        recogRef.current.abort();
        recogRef.current = null;
      }

      const recognition = new SR();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = async (event: SpeechRecognitionEvent) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        setInterim(interim);

        if (final) {
          setFinal((prev) => (prev ? prev + " " + final : final));
          setInterim("");

          // Translate and show on the OTHER side, then speak
          const translated = await translate(final, lang, targetLang);
          if (translated) {
            setTranslated((prev) =>
              prev ? prev + " " + translated : translated
            );
            speak(translated, targetLang);
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "aborted") {
          if (side === "them") setThemListening(false);
          else setYouListening(false);
        }
      };

      recognition.onend = () => {
        // Auto-restart on iOS/Safari which stops after silence
        if (recogRef.current === recognition) {
          try {
            recognition.start();
          } catch {
            if (side === "them") setThemListening(false);
            else setYouListening(false);
          }
        }
      };

      recognition.start();
      recogRef.current = recognition;
    },
    [translate, speak]
  );

  const toggleListen = useCallback(
    (side: "them" | "you") => {
      if (side === "them") {
        if (themListening) {
          themRecogRef.current?.abort();
          themRecogRef.current = null;
          setThemListening(false);
        } else {
          // Clear previous text
          setThemInterim("");
          setThemFinal("");
          setYouTranslated("");
          setThemListening(true);
          startRecognition(
            "them",
            themLang,
            youLang,
            setThemInterim,
            setThemFinal,
            setYouTranslated,
            themRecogRef
          );
        }
      } else {
        if (youListening) {
          youRecogRef.current?.abort();
          youRecogRef.current = null;
          setYouListening(false);
        } else {
          setYouInterim("");
          setYouFinal("");
          setThemTranslated("");
          setYouListening(true);
          startRecognition(
            "you",
            youLang,
            themLang,
            setYouInterim,
            setYouFinal,
            setThemTranslated,
            youRecogRef
          );
        }
      }
    },
    [
      themListening,
      youListening,
      themLang,
      youLang,
      startRecognition,
    ]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      themRecogRef.current?.abort();
      youRecogRef.current?.abort();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Top half — "Them" (upside down) */}
      <TranslatorHalf
        side="them"
        lang={themLang}
        onLangChange={setThemLang}
        isListening={themListening}
        onToggleListen={() => toggleListen("them")}
        interimText={themInterim}
        finalText={themFinal}
        translatedText={themTranslated}
        sttSupported={sttSupported}
      />

      {/* Divider */}
      <div className="relative h-px w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Bottom half — "You" */}
      <TranslatorHalf
        side="you"
        lang={youLang}
        onLangChange={setYouLang}
        isListening={youListening}
        onToggleListen={() => toggleListen("you")}
        interimText={youInterim}
        finalText={youFinal}
        translatedText={youTranslated}
        sttSupported={sttSupported}
      />
    </div>
  );
}
