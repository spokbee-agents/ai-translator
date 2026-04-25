"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  ArrowLeftRight,
  ChevronDown,
  Volume2,
} from "lucide-react";

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

function getLangShort(code: string) {
  return LANGUAGES.find((l) => l.code === code)?.short ?? code;
}

interface Message {
  id: string;
  type: "user" | "translation";
  text: string;
  langCode: string;
  langName: string;
}

// --- Language Picker Dropdown ---
function LangPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (code: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-white/90 transition-all active:scale-95 bg-white/[0.07] hover:bg-white/[0.12]"
      >
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
          {label}
        </span>
        <span>{getLangShort(value)}</span>
        <ChevronDown
          size={12}
          className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 left-0 z-50 glass rounded-2xl p-1.5 min-w-[160px] max-h-[280px] overflow-y-auto hide-scrollbar"
            >
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    onChange(l.code);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                    value === l.code
                      ? "bg-[var(--accent-orange)] text-white font-semibold"
                      : "text-white/70 hover:bg-white/[0.06]"
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Waveform Visualizer ---
function WaveformDots({ active, color }: { active: boolean; color: string }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-5">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{ backgroundColor: color }}
          animate={
            active
              ? {
                  height: [3, 14, 6, 18, 3],
                  opacity: [0.4, 1, 0.6, 1, 0.4],
                }
              : { height: 3, opacity: 0.2 }
          }
          transition={
            active
              ? {
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.12,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}

// --- Chat Bubble ---
function ChatBubble({
  message,
  onSpeak,
}: {
  message: Message;
  onSpeak: (text: string, lang: string) => void;
}) {
  const isUser = message.type === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} px-4`}
    >
      <div
        className={`max-w-[80%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-4 py-3 text-[15px] leading-relaxed ${
            isUser
              ? "bg-[var(--bubble-user)] text-white rounded-[20px] rounded-br-md"
              : "bg-[var(--bubble-ai)] text-white/90 rounded-[20px] rounded-bl-md border border-white/[0.06]"
          }`}
        >
          {message.text}
        </div>
        <div
          className={`flex items-center gap-2 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}
        >
          <span className="text-[11px] text-white/30 font-medium">
            {message.langName}
          </span>
          {!isUser && (
            <button
              onClick={() => onSpeak(message.text, message.langCode)}
              className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/[0.08] transition-colors active:scale-90"
            >
              <Volume2 size={13} className="text-white/40" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// --- Interim Bubble (live transcription) ---
function InterimBubble({
  text,
  side,
}: {
  text: string;
  side: "left" | "right";
}) {
  if (!text) return null;
  const isRight = side === "right";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex ${isRight ? "justify-end" : "justify-start"} px-4`}
    >
      <div
        className={`max-w-[80%] px-4 py-3 text-[15px] leading-relaxed italic text-white/40 ${
          isRight
            ? "bg-[var(--bubble-user)]/40 rounded-[20px] rounded-br-md"
            : "bg-white/[0.04] rounded-[20px] rounded-bl-md border border-white/[0.04]"
        }`}
      >
        {text}
      </div>
    </motion.div>
  );
}

// ============================================================
// Main App
// ============================================================
export default function Home() {
  const [leftLang, setLeftLang] = useState("es-ES");
  const [rightLang, setRightLang] = useState("en-US");

  const [messages, setMessages] = useState<Message[]>([]);
  const [leftInterim, setLeftInterim] = useState("");
  const [rightInterim, setRightInterim] = useState("");

  const [leftListening, setLeftListening] = useState(false);
  const [rightListening, setRightListening] = useState(false);

  const [sttSupported, setSttSupported] = useState(true);

  const leftRecogRef = useRef<SpeechRecognition | null>(null);
  const rightRecogRef = useRef<SpeechRecognition | null>(null);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const msgIdRef = useRef(0);

  // Check STT support
  useEffect(() => {
    const SR =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;
    if (!SR) setSttSupported(false);
  }, []);

  // Auto-scroll feed to bottom
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTo({
        top: feedRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, leftInterim, rightInterim]);

  const nextId = () => {
    msgIdRef.current += 1;
    return `msg-${msgIdRef.current}`;
  };

  // --- Translate ---
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

  // --- Speak ---
  const speak = useCallback((text: string, langCode: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, []);

  // --- Swap Languages ---
  const swapLangs = useCallback(() => {
    setLeftLang((prev) => {
      setRightLang((rPrev) => {
        setLeftLang(rPrev);
        return prev;
      });
      return prev;
    });
  }, []);

  // --- Start Recognition ---
  const startRecognition = useCallback(
    (
      side: "left" | "right",
      spokenLang: string,
      targetLang: string,
      setInterim: React.Dispatch<React.SetStateAction<string>>,
      recogRef: React.RefObject<SpeechRecognition | null>
    ) => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return;

      if (recogRef.current) {
        recogRef.current.abort();
        recogRef.current = null;
      }

      const recognition = new SR();
      recognition.lang = spokenLang;
      // iOS Safari breaks silently on continuous=true. Use walkie-talkie mode.
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = async (event: SpeechRecognitionEvent) => {
        let interim = "";
        let finalText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interim += transcript;
          }
        }

        setInterim(interim);

        if (finalText) {
          setInterim("");

          // Add user message
          const userMsg: Message = {
            id: nextId(),
            type: "user",
            text: finalText,
            langCode: spokenLang,
            langName: getLangName(spokenLang),
          };
          setMessages((prev) => [...prev, userMsg]);

          // Translate and add translation message
          const translated = await translate(finalText, spokenLang, targetLang);
          if (translated) {
            const transMsg: Message = {
              id: nextId(),
              type: "translation",
              text: translated,
              langCode: targetLang,
              langName: getLangName(targetLang),
            };
            setMessages((prev) => [...prev, transMsg]);
            speak(translated, targetLang);
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "aborted") {
          if (side === "left") setLeftListening(false);
          else setRightListening(false);
        }
      };

      recognition.onend = () => {
        // Walkie-talkie mode: auto turn off when they finish speaking
        if (side === "left") setLeftListening(false);
        else setRightListening(false);
        recogRef.current = null;
      };

      recognition.start();
      recogRef.current = recognition;
    },
    [translate, speak]
  );

  // --- Toggle Listen ---
  const toggleListen = useCallback(
    async (side: "left" | "right") => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        alert("Please allow microphone permissions in your browser settings to use the translator.");
        return;
      }
      if (side === "left") {
        if (leftListening) {
          leftRecogRef.current?.abort();
          leftRecogRef.current = null;
          setLeftListening(false);
          setLeftInterim("");
        } else {
          // Stop the other side if active
          if (rightListening) {
            rightRecogRef.current?.abort();
            rightRecogRef.current = null;
            setRightListening(false);
            setRightInterim("");
          }
          setLeftListening(true);
          startRecognition(
            "left",
            leftLang,
            rightLang,
            setLeftInterim,
            leftRecogRef
          );
        }
      } else {
        if (rightListening) {
          rightRecogRef.current?.abort();
          rightRecogRef.current = null;
          setRightListening(false);
          setRightInterim("");
        } else {
          if (leftListening) {
            leftRecogRef.current?.abort();
            leftRecogRef.current = null;
            setLeftListening(false);
            setLeftInterim("");
          }
          setRightListening(true);
          startRecognition(
            "right",
            rightLang,
            leftLang,
            setRightInterim,
            rightRecogRef
          );
        }
      }
    },
    [leftListening, rightListening, leftLang, rightLang, startRecognition]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      leftRecogRef.current?.abort();
      rightRecogRef.current?.abort();
    };
  }, []);

  const anyListening = leftListening || rightListening;

  return (
    <div className="flex flex-col h-full bg-black">
      {/* ============ HEADER ============ */}
      <header className="relative z-30 flex items-center justify-center gap-3 px-4 pt-[env(safe-area-inset-top,12px)] pb-3 glass border-0 border-b border-white/[0.06]">
        <LangPicker value={leftLang} onChange={setLeftLang} label="" />

        <motion.button
          whileTap={{ scale: 0.85, rotate: 180 }}
          onClick={swapLangs}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
        >
          <ArrowLeftRight size={16} className="text-white/60" />
        </motion.button>

        <LangPicker value={rightLang} onChange={setRightLang} label="" />
      </header>

      {/* ============ CONVERSATION FEED ============ */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto hide-scrollbar py-6 space-y-3"
      >
        {messages.length === 0 && !leftInterim && !rightInterim && (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center">
              <Mic size={28} className="text-white/20" />
            </div>
            <div>
              <p className="text-white/40 text-[15px] font-medium">
                Tap a microphone to start
              </p>
              <p className="text-white/20 text-[13px] mt-1">
                Speak in {getLangName(leftLang)} or {getLangName(rightLang)}
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} onSpeak={speak} />
        ))}

        {/* Live interim text */}
        <InterimBubble text={leftInterim} side="right" />
        <InterimBubble text={rightInterim} side="right" />
      </div>

      {/* ============ CONTROL DOCK ============ */}
      <div className="relative z-30 pb-[env(safe-area-inset-bottom,16px)] px-6 pt-4">
        <div className="glass rounded-[28px] px-6 py-5 flex items-center justify-center gap-6">
          {/* Left Language Mic */}
          <div className="flex flex-col items-center gap-2">
            <WaveformDots active={leftListening} color="#0a84ff" />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleListen("left")}
              disabled={!sttSupported}
              className={`relative flex items-center justify-center w-[68px] h-[68px] rounded-full transition-all ${
                leftListening
                  ? "bg-[var(--accent-blue)] glow-blue"
                  : "bg-white/[0.06] hover:bg-white/[0.1]"
              } ${!sttSupported ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              {leftListening ? (
                <MicOff size={26} className="text-white" />
              ) : (
                <Mic size={26} className="text-white/60" />
              )}
            </motion.button>
            <span className="text-[11px] font-semibold tracking-wide text-white/40">
              {getLangShort(leftLang)}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-16 bg-white/[0.08] rounded-full" />

          {/* Right Language Mic */}
          <div className="flex flex-col items-center gap-2">
            <WaveformDots active={rightListening} color="#FF6B00" />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleListen("right")}
              disabled={!sttSupported}
              className={`relative flex items-center justify-center w-[68px] h-[68px] rounded-full transition-all ${
                rightListening
                  ? "bg-[var(--accent-orange)] glow-orange"
                  : "bg-white/[0.06] hover:bg-white/[0.1]"
              } ${!sttSupported ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              {rightListening ? (
                <MicOff size={26} className="text-white" />
              ) : (
                <Mic size={26} className="text-white/60" />
              )}
            </motion.button>
            <span className="text-[11px] font-semibold tracking-wide text-white/40">
              {getLangShort(rightLang)}
            </span>
          </div>
        </div>

        {/* Status text */}
        <div className="text-center mt-3 mb-1">
          <AnimatePresence mode="wait">
            <motion.p
              key={anyListening ? "listening" : "idle"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-[12px] text-white/25 font-medium"
            >
              {anyListening
                ? `Listening in ${getLangName(leftListening ? leftLang : rightLang)}...`
                : sttSupported
                  ? "Hold a mic to speak"
                  : "Speech recognition unavailable"}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
