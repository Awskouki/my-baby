/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { loadProgress, saveProgress, addAchievement } from './storage';
import { FloatingParticles, PawCursorTrail, ToastContainer, ClickSparkles, showToast } from './effects';
import { 
  Book, 
  Coffee, 
  Heart, 
  Cat as CatIcon, 
  Beaker, 
  GraduationCap,
  Sparkles,
  Music,
  Volume2,
  Wind,
  CloudRain,
  Piano,
  Star,
  Send,
  CheckCircle2,
  Timer,
  Play,
  Pause,
  RotateCcw,
  StickyNote,
  Utensils,
  Leaf,
  Calendar,
  Droplets,
  Trophy,
  Glasses
} from 'lucide-react';

// --- Audio Helpers ---

const playPurr = () => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(25, ctx.currentTime);
  const lfo = ctx.createOscillator();
  lfo.frequency.setValueAtTime(4, ctx.currentTime);
  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(10, ctx.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  osc.connect(gain);
  gain.connect(ctx.destination);
  lfo.start();
  osc.start();
  setTimeout(() => {
    osc.stop();
    lfo.stop();
    ctx.close();
  }, 1000);
};

const playMeow = () => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
  osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.3);
  
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
};

const playHappyMelody = () => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
    gain.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.15);
    osc.stop(ctx.currentTime + i * 0.15 + 0.1);
  });
};

const playSadSound = () => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
};

const playTimerAlarm = () => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Play 3 beeps
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime + i * 0.4);
    
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.4);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.4 + 0.05);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.4 + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime + i * 0.4);
    osc.stop(ctx.currentTime + i * 0.4 + 0.3);
  }
  
  // Final longer beep
  setTimeout(() => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  }, 1200);
};

// --- Study Break Audio ---

let activeAudio: { stop: () => void } | null = null;

const playTone = (type: 'purr' | 'rain' | 'piano') => {
  if (activeAudio) {
    activeAudio.stop();
    activeAudio = null;
    return;
  }

  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.connect(ctx.destination);

  let osc: OscillatorNode;

  if (type === 'purr') {
    osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(20, ctx.currentTime);
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(2, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(10, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();
    osc.connect(gain);
    osc.start();
    activeAudio = { stop: () => { osc.stop(); lfo.stop(); ctx.close(); } };
  } else if (type === 'rain') {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    whiteNoise.connect(filter);
    filter.connect(gain);
    whiteNoise.start();
    activeAudio = { stop: () => { whiteNoise.stop(); ctx.close(); } };
  } else {
    // Simple piano-like sequence
    let i = 0;
    const freqs = [261.63, 329.63, 392.00, 523.25];
    const interval = setInterval(() => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freqs[i % 4], ctx.currentTime);
      g.gain.setValueAtTime(0.05, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 1);
      i++;
    }, 1000);
    activeAudio = { stop: () => { clearInterval(interval); ctx.close(); } };
  }
};

// --- New Components ---

const HydrationHero = ({ show, onClose }: { show: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="fixed bottom-10 right-10 z-[100] bg-white/90 backdrop-blur-md p-6 rounded-3xl border-2 border-blue-200 shadow-2xl flex items-center gap-4"
      >
        <div className="text-4xl">🐱💧</div>
        <div>
          <p className="font-rounded font-bold text-gray-700">Paw-se for a sip, Molka?</p>
          <p className="text-xs text-gray-500">Locking in is thirsty work! Stay hydrated.</p>
          <button
            onClick={onClose}
            className="mt-2 text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-blue-600"
          >
            Got it, Cat-tain!
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const MeowstonesModule = ({ achievements }: { achievements: string[] }) => {
  const stickers = [
    { id: 'zen', label: 'Zen Master', icon: '🧘🐱', desc: 'Breathed with the cat' },
    { id: 'buster', label: 'Stress Buster', icon: '💥🐱', desc: 'Popped 10 stress bubbles' },
    { id: 'lover', label: 'Cat Lover', icon: '💖🐱', desc: 'Petted the cat 5 times' },
    { id: 'scholar', label: 'Scholar', icon: '🎓🐱', desc: 'Completed a focus session' },
  ];

  return (
    <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm space-y-4">
      <h3 className="font-rounded font-bold text-gray-700 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-yellow-500" /> Meow-stones
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {stickers.map(s => {
          const isUnlocked = achievements.includes(s.id);
          return (
            <div
              key={s.id}
              className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-1 ${
                isUnlocked ? 'bg-white/80 border-[#ffb38e] scale-100' : 'bg-gray-100/50 border-transparent opacity-40 grayscale'
              }`}
            >
              <span className="text-2xl">{s.icon}</span>
              <p className="text-[10px] font-bold text-gray-700 leading-tight">{s.label}</p>
              {isUnlocked && <p className="text-[8px] text-gray-400">{s.desc}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PetTheCat = ({ onPet }: { onPet: () => void }) => {
  const [isPetting, setIsPetting] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);

  const handlePet = () => {
    setIsPetting(true);
    playPurr();
    onPet();
    const id = Date.now();
    setHearts(prev => [...prev, { id, x: Math.random() * 100 - 50 }]);
    setTimeout(() => {
      setIsPetting(false);
      setHearts(prev => prev.filter(h => h.id !== id));
    }, 1000);
  };

  return (
    <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm text-center space-y-4 relative overflow-hidden">
      <h3 className="font-rounded font-bold text-gray-700">Pet the cat</h3>
      <div className="relative flex justify-center py-4 cursor-pointer" onMouseDown={handlePet} onTouchStart={handlePet}>
        <AnimatePresence>
          {hearts.map(h => (
            <motion.div
              key={h.id}
              initial={{ y: 0, opacity: 1, scale: 0.5 }}
              animate={{ y: -100, opacity: 0, scale: 1.5 }}
              exit={{ opacity: 0 }}
              className="absolute text-red-400"
              style={{ left: `calc(50% + ${h.x}px)` }}
            >
              <Heart className="fill-current w-6 h-6" />
            </motion.div>
          ))}
        </AnimatePresence>
        <motion.div
          animate={isPetting ? { scale: [1, 1.05, 1], rotate: [-2, 2, -2] } : {}}
          className="text-7xl select-none"
        >
          {isPetting ? "😸" : "🐱"}
        </motion.div>
      </div>
      <p className="text-xs font-rounded text-gray-400">Click or tap to pet Molka's digital companion</p>
    </div>
  );
};

const CatModoro = ({ onComplete, isActive, setIsActive }: { onComplete: () => void; isActive: boolean; setIsActive: (val: boolean) => void }) => {
  const [timeLeft, setTimeLeft] = useState(120 * 60);
  const [mode, setMode] = useState<'WORK' | 'BREAK'>('WORK');

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      playTimerAlarm();
      setIsActive(false);
      if (mode === 'WORK') {
        onComplete();
        setMode('BREAK');
        setTimeLeft(15 * 60);
      } else {
        setMode('WORK');
        setTimeLeft(120 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm text-center space-y-4">
      <h3 className="font-rounded font-bold text-gray-700 flex items-center justify-center gap-2">
        <Timer className="w-4 h-4" /> Cat-modoro
      </h3>
      
      {/* Enhanced Dynamic Study Buddy */}
      <div className="relative flex justify-center py-4 h-24">
        <AnimatePresence mode="wait">
          {mode === 'WORK' ? (
            <motion.div
              key="work"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative flex items-center justify-center"
            >
              {/* The Cat */}
              <motion.div
                animate={isActive ? { 
                  y: [0, -2, 0],
                  rotate: [0, -1, 1, 0]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl relative z-10"
              >
                🐱
                {/* Tiny Glasses */}
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-[18px] left-1/2 -translate-x-1/2 text-xl pointer-events-none"
                  >
                    👓
                  </motion.div>
                )}
              </motion.div>

              {/* The Book */}
              <motion.div 
                animate={isActive ? { rotate: [-2, 2, -2] } : {}}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-1 text-4xl z-20"
              >
                📖
              </motion.div>

              {/* Floating Pencil when active */}
              {isActive && (
                <motion.div
                  animate={{ 
                    x: [10, 20, 10],
                    y: [-10, -15, -10],
                    rotate: [0, 20, 0]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute right-0 text-xl z-30"
                >
                  ✏️
                </motion.div>
              )}

              {/* Occasional Idea Lightbulb */}
              {isActive && (
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5]
                  }}
                  transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                  className="absolute -top-6 -right-4 text-2xl"
                >
                  💡
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="break"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl"
              >
                😴🐱
              </motion.div>
              {/* Floating Zzz */}
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5, x: 20, y: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 1.5],
                    x: [20, 40, 50],
                    y: [0, -30, -60]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    delay: i * 1,
                    ease: "easeOut"
                  }}
                  className="absolute text-blue-400 font-bold text-sm"
                >
                  Z
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-4xl font-mono font-bold text-gray-800 bg-white/50 py-3 rounded-2xl">
        {formatTime(timeLeft)}
      </div>
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setIsActive(!isActive)}
          className="p-3 rounded-full bg-[#ffb38e] text-white hover:scale-110 transition-all"
        >
          {isActive ? <Pause /> : <Play />}
        </button>
        <button
          onClick={() => { setIsActive(false); setTimeLeft(mode === 'WORK' ? 120 * 60 : 15 * 60); }}
          className="p-3 rounded-full bg-gray-200 text-gray-600 hover:scale-110 transition-all"
        >
          <RotateCcw />
        </button>
      </div>
      <p className="text-[10px] font-rounded text-gray-400 uppercase tracking-widest">
        {mode === 'WORK' ? "lock in baby <3" : "Break Time, Molka"}
      </p>
    </div>
  );
};

const CatFiRadio = () => {
  return (
    <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm space-y-4">
      <h3 className="font-rounded font-bold text-gray-700 flex items-center gap-2">
        🎵 Study Vibes for Molka
      </h3>
      <div className="relative rounded-2xl overflow-hidden">
        <iframe 
          style={{ borderRadius: '12px' }}
          src="https://open.spotify.com/embed/playlist/0FdfpgNWpXlFRb8vkvWj1I?utm_source=generator&theme=0" 
          width="100%" 
          height="352" 
          frameBorder="0" 
          allowFullScreen={false}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
        />
      </div>
      <p className="text-[10px] font-rounded text-gray-400 text-center">
        Curated just for you 💜🐱
      </p>
    </div>
  );
};


const SnackGeneratorModule = () => {
  const [snack, setSnack] = useState<{ name: string; icon: string } | null>(null);
  const snacks = [
    { name: "Apple slices with almond butter", icon: "🍎" },
    { name: "A cozy Matcha Latte", icon: "🍵" },
    { name: "Dark chocolate & walnuts", icon: "🍫" },
    { name: "Greek yogurt with honey", icon: "🥣" },
    { name: "Blueberries (Brain berries!)", icon: "🫐" },
    { name: "Hummus & carrot sticks", icon: "🥕" },
  ];

  const generate = () => {
    const rand = snacks[Math.floor(Math.random() * snacks.length)];
    setSnack(rand);
    playMeow();
  };

  return (
    <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm text-center space-y-4">
      <h3 className="font-rounded font-bold text-gray-700 flex items-center justify-center gap-2">
        <Utensils className="w-4 h-4" /> Brain Food Generator
      </h3>
      <button
        onClick={generate}
        className="w-full py-2 rounded-full bg-white/80 font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-sm"
      >
        What should I eat, Cat-chef?
      </button>
      <AnimatePresence mode="wait">
        {snack && (
          <motion.div
            key={snack.name}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-3 bg-white/60 p-3 rounded-2xl"
          >
            <span className="text-3xl">{snack.icon}</span>
            <p className="text-sm font-rounded font-bold text-gray-700">{snack.name}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DeskPlantModule = ({ growth }: { growth: number }) => {
  const stages = ["🌱", "🌿", "🪴", "🌵", "🌸"];
  const stage = stages[Math.min(Math.floor(growth / 2), stages.length - 1)];

  return (
    <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm text-center space-y-4">
      <h3 className="font-rounded font-bold text-gray-700 flex items-center justify-center gap-2">
        <Leaf className="w-4 h-4 text-green-500" /> Molka's Desk Plant
      </h3>
      <div className="relative h-24 flex items-end justify-center">
        <motion.div
          key={stage}
          initial={{ scale: 0 }}
          animate={{ scale: 1 + growth * 0.05 }}
          className="text-6xl relative z-10"
        >
          {stage}
        </motion.div>
        <div className="absolute bottom-0 w-16 h-8 plant-pot" />
      </div>
      <p className="text-[10px] font-rounded text-gray-400 uppercase tracking-widest">
        Grows as you take care of yourself
      </p>
    </div>
  );
};

const FreedomCountdownModule = () => {
  const [timeLeft, setTimeLeft] = useState("");
  // Defaulting to a future date, e.g., end of typical exam season
  const targetDate = new Date("2026-06-15T00:00:00").getTime();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm text-center space-y-4">
      <h3 className="font-rounded font-bold text-gray-700 flex items-center justify-center gap-2">
        <Calendar className="w-4 h-4" /> Freedom Countdown
      </h3>
      <div className="text-2xl font-mono font-bold text-[#ffb38e] countdown-glow">
        {timeLeft}
      </div>
      <p className="text-[10px] font-rounded text-gray-400 uppercase tracking-widest">
        Until exams are over & freedom begins!
      </p>
    </div>
  );
};

const AffirmationJarModule = () => {
  const [affirmation, setAffirmation] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const affirmations = [
    "Molka, your worth is not defined by a grade.",
    "You are capable of amazing things.",
    "One step at a time, one paw at a time.",
    "You've worked so hard, Molka. Be proud.",
    "The world needs your unique brain.",
    "You are more than your exam results.",
    "Take a breath. You are doing enough.",
  ];

  const pickOne = () => {
    setIsShaking(true);
    setTimeout(() => {
      const rand = affirmations[Math.floor(Math.random() * affirmations.length)];
      setAffirmation(rand);
      setIsShaking(false);
      playMeow();
    }, 500);
  };

  return (
    <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm text-center space-y-4">
      <h3 className="font-rounded font-bold text-gray-700">Paw-sitive Affirmations Jar</h3>
      <div className="relative flex justify-center py-4">
        <motion.div
          animate={isShaking ? { rotate: [-5, 5, -5, 5, 0] } : {}}
          onClick={pickOne}
          className="text-7xl cursor-pointer select-none"
        >
          🫙
        </motion.div>
        <AnimatePresence>
          {affirmation && (
            <motion.div
              initial={{ scale: 0, y: 50, rotate: -20 }}
              animate={{ scale: 1, y: -80, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute affirmation-paper p-4 w-48 z-20"
            >
              <p className="font-hand text-sm text-gray-700 leading-tight">"{affirmation}"</p>
              <button onClick={() => setAffirmation("")} className="absolute -top-2 -right-2 bg-red-400 text-white rounded-full w-5 h-5 text-[10px]">×</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="text-xs font-rounded text-gray-400">Click the jar for a little boost, Molka</p>
    </div>
  );
};

const Chalkboard = () => (
  <div className="w-full max-w-2xl mx-auto mt-8 p-6 bg-[#1a2f1a] border-8 border-[#4d3319] rounded-lg shadow-2xl relative overflow-hidden">
    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:20px_20px]" />
    <div className="relative font-mono text-white text-lg md:text-xl leading-relaxed">
      <p className="chalkboard-text inline-block">
        Problem: Find a partner who’s smart, kind, and loves cats.
      </p>
      <div className="mt-2 text-[#a8d8ea] font-hand text-2xl">
        Solution: ...
      </div>
    </div>
  </div>
);

const Doodles = ({ opacity = 0.2 }: { opacity?: number }) => (
  <div className="fixed inset-0 pointer-events-none z-0" style={{ opacity }}>
    <Beaker className="absolute bottom-20 left-20 w-10 h-10 text-[#a8d8ea] -rotate-12" />
    <GraduationCap className="absolute top-40 right-20 w-14 h-14 text-[#ffd1dc] rotate-6" />
    <Star className="absolute top-1/4 left-1/4 w-6 h-6 text-yellow-400 animate-pulse" />
    <Star className="absolute bottom-1/4 right-1/4 w-4 h-4 text-yellow-200 animate-pulse delay-700" />
    <div className="absolute bottom-40 right-40 w-8 h-8 border-2 border-[#ffb38e] rounded-full flex items-center justify-center">
      <div className="w-4 h-4 bg-[#ffb38e] rounded-full" />
    </div>
    <div className="absolute top-1/2 left-10 w-16 h-16 border-t-2 border-l-2 border-[#a8d8ea] rounded-tl-3xl" />
  </div>
);

const Bookshelf = () => {
  const books = [
    { title: "Advanced Cat Behavior", color: "bg-[#ffb38e]" },
    { title: "Calculus for Romantics", color: "bg-[#a8d8ea]" },
    { title: "The Art of Napping", color: "bg-[#ffd1dc]" },
  ];

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-4 z-10 hidden lg:flex">
      {books.map((book, i) => (
        <motion.div
          key={i}
          whileHover={{ x: 20, scale: 1.1 }}
          className={`${book.color} p-2 rounded-r-md border-y border-r border-black/10 shadow-sm cursor-help flex items-center gap-2 group`}
        >
          <Book className="w-4 h-4" />
          <span className="text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {book.title}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

const CoffeeMug = () => (
  <motion.div 
    animate={{ y: [0, -10, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    className="fixed right-10 top-1/4 z-10"
  >
    <div className="relative">
      <div className="absolute -top-8 left-4 flex flex-col gap-1">
        {[1, 2, 3].map(i => (
          <motion.div
            key={i}
            animate={{ y: [0, -20], opacity: [0.5, 0], scale: [1, 1.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
            className="w-1 h-4 bg-gray-300 rounded-full blur-[1px]"
          />
        ))}
      </div>
      <div className="w-12 h-10 bg-white border-2 border-gray-200 rounded-b-xl rounded-t-sm relative">
        <div className="absolute -right-4 top-2 w-4 h-6 border-2 border-gray-200 rounded-r-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <CatIcon className="w-6 h-6 text-gray-400" />
        </div>
      </div>
    </div>
  </motion.div>
);

const CatCorner = () => {
  const [isAwake, setIsAwake] = useState(false);
  const [showMeow, setShowMeow] = useState(false);

  const handleClick = () => {
    setIsAwake(true);
    setShowMeow(true);
    playMeow();
    setTimeout(() => {
      setIsAwake(false);
      setShowMeow(false);
    }, 3000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 cursor-pointer" onClick={handleClick}>
      <AnimatePresence>
        {showMeow && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0 }}
            className="absolute -top-12 left-0 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm text-sm font-hand font-bold"
          >
            Meow! 🐾
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        animate={isAwake ? { rotate: [0, -5, 5, 0], scale: 1.1 } : {}}
        className="text-4xl"
      >
        {isAwake ? "🐱" : "🐈‍⬛"}
      </motion.div>
    </div>
  );
};

const WalkingCat = () => {
  const [paws, setPaws] = useState<{ id: number; x: number; y: number }[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = nextId.current++;
      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight - 40;
      setPaws(prev => [...prev, { id, x, y }]);
      setTimeout(() => {
        setPaws(prev => prev.filter(p => p.id !== id));
      }, 3000);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {paws.map(paw => (
        <div
          key={paw.id}
          className="paw-print absolute text-xs opacity-40"
          style={{ left: paw.x, top: paw.y }}
        >
          🐾
        </div>
      ))}
    </div>
  );
};

// --- Study Break Modules ---

const BreatheModule = ({ onBreathe }: { onBreathe: () => void }) => {
  const [phase, setPhase] = useState('In');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(prev => prev === 'In' ? 'Out' : 'In');
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    onBreathe();
  }, []);

  return (
    <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm text-center space-y-4">
      <h3 className="font-rounded font-bold text-gray-700">Breathe with a cat</h3>
      <div className="relative flex justify-center py-4">
        <motion.div
          animate={{ scale: phase === 'In' ? 1.2 : 0.8 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner"
        >
          <CatIcon className="w-12 h-12 text-[#ffb38e]" />
        </motion.div>
      </div>
      <p className="font-hand text-2xl text-gray-600">Breathe {phase.toLowerCase()}...</p>
      <p className="text-xs font-rounded text-gray-400 italic">You've got this, Molka.</p>
    </div>
  );
};

const BubblePopModule = ({ onPop }: { onPop: () => void }) => {
  const [poppedCount, setPoppedCount] = useState(0);
  const [bubbles, setBubbles] = useState([
    { id: 1, label: "Exam panic", popped: false, x: 10, y: 10 },
    { id: 2, label: "Deadline", popped: false, x: 60, y: 20 },
    { id: 3, label: "GPA stress", popped: false, x: 20, y: 50 },
    { id: 4, label: "Overthinking", popped: false, x: 70, y: 60 },
    { id: 5, label: "Too much coffee", popped: false, x: 40, y: 80 },
    { id: 6, label: "Comparison trap", popped: false, x: 10, y: 90 },
  ]);

  const handlePop = (id: number) => {
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b));
    setPoppedCount(prev => prev + 1);
    onPop();
  };

  return (
    <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm space-y-4 h-[300px] relative overflow-hidden">
      <div className="flex justify-between items-center relative z-10">
        <h3 className="font-rounded font-bold text-gray-700">Pop the stress bubbles</h3>
        <span className="text-xs font-mono bg-white/50 px-2 py-1 rounded-full">Stress popped: {poppedCount}</span>
      </div>
      <div className="absolute inset-0">
        {bubbles.map(bubble => (
          <motion.button
            key={bubble.id}
            disabled={bubble.popped}
            onClick={() => handlePop(bubble.id)}
            animate={{ 
              x: [bubble.x + "%", (bubble.x + 5) + "%", (bubble.x - 5) + "%", bubble.x + "%"],
              y: [bubble.y + "%", (bubble.y - 10) + "%", (bubble.y + 5) + "%", bubble.y + "%"]
            }}
            transition={{ duration: 10 + Math.random() * 5, repeat: Infinity, ease: "linear" }}
            className={`absolute cursor-paw p-3 rounded-full border-2 transition-all text-[10px] font-rounded font-bold flex items-center justify-center min-w-[80px] min-h-[80px] ${
              bubble.popped 
                ? "border-transparent bg-transparent text-pink-400" 
                : "border-white bg-white/50 hover:bg-white text-gray-600 shadow-lg backdrop-blur-sm"
            }`}
            style={{ left: bubble.x + "%", top: bubble.y + "%" }}
          >
            {bubble.popped ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                <Heart className="w-4 h-4 fill-current" /> pop!
              </motion.div>
            ) : bubble.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const ComplimentModule = ({ onGenerate }: { onGenerate: () => void }) => {
  const [compliment, setCompliment] = useState("");
  const compliments = [
    "Molka, you've studied more than anyone I know. That's paw-some.",
    "Your brain is basically a library with legs. Respect.",
    "Even your highlighter is proud of you.",
    "Cats nap. You conquer. Balance, Molka.",
    "One more page? No. One more deep breath first.",
    "Molka + her notes = unstoppable. Now drink water.",
    "You're not behind. You're exactly where you need to be.",
    "If studying was an Olympic sport, you'd win gold. And a cat.",
    "Rest is productive too. Said every smart cat ever.",
  ];

  const generate = () => {
    const rand = compliments[Math.floor(Math.random() * compliments.length)];
    setCompliment(rand);
    playMeow();
    onGenerate();
  };

  return (
    <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm text-center space-y-4">
      <h3 className="font-rounded font-bold text-gray-700">Cat compliment generator</h3>
      <button
        onClick={generate}
        className="cursor-heart bg-white/80 hover:bg-white px-6 py-3 rounded-full font-rounded font-bold text-[#ffb38e] shadow-sm transition-all"
      >
        Need a smile, Molka?
      </button>
      <AnimatePresence mode="wait">
        {compliment && (
          <motion.div
            key={compliment}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-4 rounded-2xl relative mt-4 shadow-sm"
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
            <p className="font-hand text-xl text-gray-700 italic">"{compliment}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StudyGamesModule = ({ onComplete }: { onComplete: () => void }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [gameType, setGameType] = useState<'quiz' | 'flashcard' | 'scramble' | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);

  const subjects = {
    'Biology': {
      quiz: [
        { q: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi'], correct: 1 },
        { q: 'What is DNA short for?', options: ['Deoxyribonucleic Acid', 'Diribonucleic Acid', 'Deoxyribose Acid', 'Deoxyribonuclear Acid'], correct: 0 },
        { q: 'How many chromosomes do humans have?', options: ['23', '46', '48', '44'], correct: 1 },
      ],
      flashcards: [
        { term: 'Photosynthesis', definition: 'Process plants use to make food from sunlight' },
        { term: 'Mitosis', definition: 'Cell division that produces two identical cells' },
        { term: 'Enzyme', definition: 'Protein that speeds up chemical reactions' },
      ]
    },
    'Chemistry': {
      quiz: [
        { q: 'What is the chemical symbol for water?', options: ['H2O', 'O2', 'CO2', 'H2O2'], correct: 0 },
        { q: 'What is the pH of a neutral solution?', options: ['0', '7', '14', '10'], correct: 1 },
        { q: 'What is the most abundant gas in Earth\'s atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], correct: 2 },
      ],
      flashcards: [
        { term: 'Atom', definition: 'Smallest unit of matter' },
        { term: 'Molecule', definition: 'Two or more atoms bonded together' },
        { term: 'Ion', definition: 'Atom with electric charge' },
      ]
    },
    'Math': {
      quiz: [
        { q: 'What is 15% of 200?', options: ['20', '30', '40', '50'], correct: 1 },
        { q: 'What is the value of π (pi) approximately?', options: ['3.14', '2.71', '1.41', '1.73'], correct: 0 },
        { q: 'What is the square root of 144?', options: ['10', '11', '12', '13'], correct: 2 },
      ],
      flashcards: [
        { term: 'Hypotenuse', definition: 'Longest side of a right triangle' },
        { term: 'Prime Number', definition: 'Number only divisible by 1 and itself' },
        { term: 'Fraction', definition: 'Part of a whole number' },
      ]
    },
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setGameType(null);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
  };

  const handleGameSelect = (type: 'quiz' | 'flashcard') => {
    setGameType(type);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Already answered
    
    setSelectedAnswer(answerIndex);
    const questions = subjects[selectedSubject as keyof typeof subjects].quiz;
    const isCorrect = answerIndex === questions[currentQuestion].correct;
    
    if (isCorrect) {
      setScore(score + 1);
      playHappyMelody();
    } else {
      playSadSound();
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
        if (score + (isCorrect ? 1 : 0) >= questions.length * 0.7) {
          onComplete();
          confetti({ particleCount: 100, spread: 70 });
        }
      }
    }, 1500);
  };

  const resetGame = () => {
    setSelectedSubject(null);
    setGameType(null);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  if (!selectedSubject) {
    return (
      <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm space-y-4">
        <h3 className="font-rounded font-bold text-gray-700 flex items-center gap-2">
          🎮 Study Break Games
        </h3>
        <p className="text-xs text-gray-500 font-rounded">Pick a subject for a quick brain workout!</p>
        <div className="grid grid-cols-1 gap-3">
          {Object.keys(subjects).map(subject => (
            <button
              key={subject}
              onClick={() => handleSubjectSelect(subject)}
              className="bg-white/80 hover:bg-white p-4 rounded-xl font-rounded font-bold text-gray-700 transition-all hover:scale-105 shadow-sm"
            >
              {subject} 📚
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!gameType) {
    return (
      <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-rounded font-bold text-gray-700">{selectedSubject}</h3>
          <button onClick={resetGame} className="text-xs text-gray-400 hover:text-gray-600">← Back</button>
        </div>
        <p className="text-xs text-gray-500 font-rounded">Choose your game mode:</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleGameSelect('quiz')}
            className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-xl font-rounded font-bold text-gray-700 transition-all hover:scale-105 shadow-sm"
          >
            <div className="text-3xl mb-2">❓</div>
            Quick Quiz
          </button>
          <button
            onClick={() => handleGameSelect('flashcard')}
            className="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 rounded-xl font-rounded font-bold text-gray-700 transition-all hover:scale-105 shadow-sm"
          >
            <div className="text-3xl mb-2">🃏</div>
            Flashcards
          </button>
        </div>
      </div>
    );
  }

  if (gameType === 'quiz') {
    const questions = subjects[selectedSubject as keyof typeof subjects].quiz;
    const currentQ = questions[currentQuestion];

    if (showResult) {
      const percentage = Math.round((score / questions.length) * 100);
      return (
        <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm space-y-4 text-center">
          <div className="text-6xl mb-4">{percentage >= 70 ? '🎉' : '💪'}</div>
          <h3 className="font-rounded font-bold text-gray-700 text-2xl">
            {percentage >= 70 ? 'Amazing, Molka!' : 'Good try!'}
          </h3>
          <p className="text-4xl font-bold text-[#ffb38e]">{score}/{questions.length}</p>
          <p className="text-sm text-gray-500 font-rounded">
            {percentage >= 70 ? 'You\'re crushing it! 🐱' : 'Practice makes paw-fect! 🐾'}
          </p>
          <button
            onClick={resetGame}
            className="neon-button px-6 py-3 rounded-full font-bold text-white shadow-lg transition-all"
          >
            Play Again
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono bg-white/50 px-3 py-1 rounded-full">
            Question {currentQuestion + 1}/{questions.length}
          </span>
          <span className="text-xs font-mono bg-[#ffb38e]/20 px-3 py-1 rounded-full">
            Score: {score}
          </span>
        </div>
        
        <h4 className="font-rounded font-bold text-gray-700 text-lg">{currentQ.q}</h4>
        
        <div className="space-y-2">
          {currentQ.options.map((option, idx) => {
            let bgColor = 'bg-white/80 hover:bg-white';
            if (selectedAnswer !== null) {
              if (idx === currentQ.correct) {
                bgColor = 'bg-green-200 border-2 border-green-400';
              } else if (idx === selectedAnswer) {
                bgColor = 'bg-red-200 border-2 border-red-400';
              }
            }
            
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={selectedAnswer !== null}
                className={`w-full p-3 rounded-xl font-rounded text-left transition-all ${bgColor} ${selectedAnswer === null ? 'hover:scale-102' : ''}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Flashcard mode
  const flashcards = subjects[selectedSubject as keyof typeof subjects].flashcards;
  const currentCard = flashcards[currentQuestion];

  return (
    <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono bg-white/50 px-3 py-1 rounded-full">
          Card {currentQuestion + 1}/{flashcards.length}
        </span>
        <button onClick={resetGame} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <div 
        onClick={() => setFlipped(!flipped)}
        className="bg-white p-8 rounded-2xl shadow-lg cursor-pointer min-h-[200px] flex items-center justify-center text-center transition-all hover:scale-105"
      >
        <div>
          <p className="text-xs text-gray-400 mb-2">{flipped ? 'Definition' : 'Term'}</p>
          <p className="font-rounded font-bold text-xl text-gray-700">
            {flipped ? currentCard.definition : currentCard.term}
          </p>
          <p className="text-xs text-gray-400 mt-4">Tap to flip</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            if (currentQuestion > 0) {
              setCurrentQuestion(currentQuestion - 1);
              setFlipped(false);
            }
          }}
          disabled={currentQuestion === 0}
          className="flex-1 py-2 rounded-xl bg-white/80 hover:bg-white disabled:opacity-50 font-rounded font-bold text-gray-700"
        >
          ← Previous
        </button>
        <button
          onClick={() => {
            if (currentQuestion < flashcards.length - 1) {
              setCurrentQuestion(currentQuestion + 1);
              setFlipped(false);
            } else {
              onComplete();
              confetti({ particleCount: 50, spread: 60 });
              resetGame();
            }
          }}
          className="flex-1 py-2 rounded-xl bg-[#ffb38e] hover:bg-[#ff9d6e] text-white font-rounded font-bold"
        >
          {currentQuestion < flashcards.length - 1 ? 'Next →' : 'Finish! 🎉'}
        </button>
      </div>
    </div>
  );
};

const SoundModule = () => {
  const [active, setActive] = useState<string | null>(null);

  const toggle = (type: string) => {
    if (active === type) {
      playTone(type as any);
      setActive(null);
    } else {
      if (active) playTone(active as any);
      playTone(type as any);
      setActive(type);
    }
  };

  return (
    <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm space-y-4">
      <h3 className="font-rounded font-bold text-gray-700">Soft sounds</h3>
      <div className="flex gap-2">
        {[
          { id: 'purr', icon: Wind, label: 'Purr' },
          { id: 'rain', icon: CloudRain, label: 'Rain' },
          { id: 'piano', icon: Piano, label: 'Piano' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => toggle(s.id)}
            className={`flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
              active === s.id ? "border-[#ffb38e] bg-white" : "border-white bg-white/50"
            }`}
          >
            <s.icon className={`w-5 h-5 ${active === s.id ? "text-[#ffb38e]" : "text-gray-400"}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{s.label}</span>
          </button>
        ))}
      </div>
      <p className="text-[10px] font-rounded text-gray-400 text-center">No pressure — just here if you need background calm, Molka.</p>
    </div>
  );
};

const ProudModule = ({ onAdd }: { onAdd: (item: string) => void }) => {
  const [text, setText] = useState("");
  const [show, setShow] = useState(false);

  const handleSubmit = () => {
    if (text.trim()) {
      onAdd(text);
      setShow(true);
    }
  };

  return (
    <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm space-y-4">
      <h3 className="font-rounded font-bold text-gray-700">Send yourself a smile</h3>
      {!show ? (
        <div className="space-y-3">
          <label className="text-xs font-rounded text-gray-500">One tiny thing you're proud of today, Molka:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="flex-1 bg-white/50 border-2 border-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#ffb38e]"
            />
            <button
              onClick={handleSubmit}
              className="bg-[#ffb38e] text-white p-2 rounded-xl hover:scale-105 transition-transform"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center space-y-3">
          <div className="bg-white p-4 rounded-2xl shadow-sm inline-block">
            <p className="font-hand text-xl text-gray-700">"{text}"</p>
          </div>
          <p className="font-rounded font-bold text-[#ffb38e] text-sm">See? You're doing great, Molka. 🐾</p>
          <button onClick={() => { setShow(false); setText(""); }} className="text-[10px] text-gray-400 underline">Write another</button>
        </motion.div>
      )}
    </div>
  );
};

// Cat-Themed To-Do List
interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

const CatToDoList = () => {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('molka_todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    localStorage.setItem('molka_todos', JSON.stringify(todos));
  }, [todos]);

  const addTask = () => {
    if (newTask.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask("");
      playMeow();
    }
  };

  const toggleTask = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
    playPurr();
  };

  const deleteTask = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-rounded font-bold text-gray-700 flex items-center gap-2">
          📝 Molka's To-Do List
        </h3>
        <span className="text-xs font-mono bg-white/50 px-2 py-1 rounded-full">
          {completedCount}/{todos.length} done
        </span>
      </div>

      {/* Add Task Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a task... 🐾"
          className="flex-1 bg-white/50 border-2 border-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#ffb38e] placeholder:text-gray-400"
        />
        <button
          onClick={addTask}
          className="neon-button text-white p-2 rounded-xl hover:scale-105 transition-transform"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {todos.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm font-rounded">
              <div className="text-4xl mb-2">😴</div>
              No tasks yet. Add one to get started!
            </div>
          ) : (
            todos.map(todo => (
              <motion.div
                key={todo.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  todo.completed 
                    ? 'bg-green-50/50 border border-green-200' 
                    : 'bg-white/50 border border-white'
                }`}
              >
                {/* Custom Paw Checkbox */}
                <button
                  onClick={() => toggleTask(todo.id)}
                  className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-[#ffb38e] flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: todo.completed ? '#ffb38e' : 'transparent'
                  }}
                >
                  {todo.completed && <span className="text-white text-sm">🐾</span>}
                </button>

                {/* Task Text */}
                <span 
                  className={`flex-1 text-sm font-rounded ${
                    todo.completed 
                      ? 'line-through text-gray-400' 
                      : 'text-gray-700'
                  }`}
                >
                  {todo.text}
                </span>

                {/* Delete Button */}
                <button
                  onClick={() => deleteTask(todo.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <span className="text-lg">×</span>
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Encouragement */}
      {completedCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center text-xs font-rounded text-[#ffb38e] font-bold"
        >
          {completedCount === todos.length 
            ? "All done! You're amazing, Molka! 🎉🐱" 
            : `Keep going! You've got this! 💪🐱`}
        </motion.div>
      )}
    </div>
  );
};

const WallOfPride = ({ items }: { items: string[] }) => (
  <div className="bg-white/40 p-6 rounded-3xl border border-white/20 shadow-sm space-y-4">
    <h3 className="font-rounded font-bold text-gray-700 flex items-center gap-2">
      <StickyNote className="w-4 h-4" /> Molka's Wall of Pride
    </h3>
    <div className="flex flex-wrap gap-3">
      <AnimatePresence>
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: i % 2 === 0 ? -2 : 2 }}
            className="sticky-note p-3 min-w-[100px] max-w-[150px] text-xs font-hand font-bold text-gray-700"
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>
      {items.length === 0 && (
        <p className="text-xs text-gray-400 italic w-full text-center py-4">Your wins will appear here, Molka...</p>
      )}
    </div>
  </div>
);

const StudyBreakCorner = ({ onFinish }: { onFinish: () => void }) => {
  const [timer, setTimer] = useState(60);
  const [prideItems, setPrideItems] = useState<string[]>([]);
  
  // Load saved progress on mount
  const [plantGrowth, setPlantGrowth] = useState(() => {
    const saved = loadProgress();
    console.log('Loaded progress on mount:', saved);
    return saved.plantGrowth;
  });
  const [petCount, setPetCount] = useState(() => loadProgress().petCount);
  const [poppedTotal, setPoppedTotal] = useState(() => loadProgress().bubblesPoppedTotal);
  const [achievements, setAchievements] = useState<string[]>(() => loadProgress().achievements);
  const [focusSessions, setFocusSessions] = useState(() => loadProgress().focusSessionsCompleted);
  const [showHydration, setShowHydration] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Save progress whenever it changes
  useEffect(() => {
    const updatedProgress = {
      achievements,
      plantGrowth,
      petCount,
      bubblesPoppedTotal: poppedTotal,
      focusSessionsCompleted: focusSessions,
      lastVisit: new Date().toISOString(),
    };
    console.log('Saving progress:', updatedProgress);
    saveProgress(updatedProgress);
  }, [achievements, plantGrowth, petCount, poppedTotal, focusSessions]);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  // Hydration Hero Logic (every 45 mins)
  useEffect(() => {
    const interval = setInterval(() => {
      setShowHydration(true);
    }, 45 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const unlockAchievement = (id: string) => {
    const newAchievements = addAchievement(achievements, id);
    if (newAchievements.length > achievements.length) {
      setAchievements(newAchievements);
      confetti({ particleCount: 50, spread: 60, colors: ['#ffb38e', '#ffd1dc'] });
      
      // Show toast notification
      const achievementNames: Record<string, { title: string; message: string }> = {
        zen: { title: 'Zen Master Unlocked! 🧘🐱', message: 'You took a moment to breathe. Proud of you!' },
        buster: { title: 'Stress Buster Unlocked! 💥🐱', message: 'You popped 10 stress bubbles. Keep going!' },
        lover: { title: 'Cat Lover Unlocked! 💖🐱', message: 'You petted the cat 5 times. So sweet!' },
        scholar: { title: 'Scholar Unlocked! 🎓🐱', message: 'You completed a focus session. Amazing work!' },
      };
      
      const achievement = achievementNames[id];
      if (achievement) {
        showToast('🏆', achievement.title, achievement.message);
      }
    }
  };

  const handleAction = () => {
    setPlantGrowth(prev => Math.min(prev + 1, 10));
  };

  return (
    <div className="min-h-screen bg-study-break p-6 md:p-12 font-rounded overflow-x-hidden">
      <FloatingParticles />
      <PawCursorTrail />
      <ClickSparkles />
      <ToastContainer />
      <Doodles opacity={0.4} />
      <HydrationHero show={showHydration} onClose={() => setShowHydration(false)} />
      <CatCorner />
      <WalkingCat />
      
      <header className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text flex items-center justify-center gap-2">
          My Princess Molka <Sparkles className="w-8 h-8 text-yellow-400" />
        </h1>
        <div className="bg-white/30 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm inline-block">
          <p className="chalkboard-text text-lg md:text-xl text-gray-700 font-medium">
            Hey Molka. Exams are tough. You're tougher. Take 60 seconds for yourself. 💜
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 font-mono text-sm">
            <Volume2 className="w-4 h-4" /> {timer}s left of calm
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 relative z-10">
        <BreatheModule onBreathe={() => unlockAchievement('zen')} />
        <PetTheCat onPet={() => {
          const newCount = petCount + 1;
          setPetCount(newCount);
          if (newCount >= 5) unlockAchievement('lover');
        }} />
        <CatModoro 
          isActive={isTimerActive}
          setIsActive={setIsTimerActive}
          onComplete={() => {
            unlockAchievement('scholar');
            setFocusSessions(prev => prev + 1);
          }} 
        />
        <CatFiRadio />
        <MeowstonesModule achievements={achievements} />
        <SnackGeneratorModule />
        <DeskPlantModule growth={plantGrowth} />
        <FreedomCountdownModule />
        <CatToDoList />
        <StudyGamesModule onComplete={() => {
          handleAction();
          setPlantGrowth(prev => prev + 1);
        }} />
        <AffirmationJarModule />
        <BubblePopModule onPop={() => {
          handleAction();
          const newTotal = poppedTotal + 1;
          setPoppedTotal(newTotal);
          if (newTotal >= 10) unlockAchievement('buster');
        }} />
        <ComplimentModule onGenerate={handleAction} />
        <SoundModule />
        <div className="space-y-6">
          <ProudModule onAdd={(item) => { setPrideItems(prev => [...prev, item]); handleAction(); }} />
          <WallOfPride items={prideItems} />
        </div>
        
        <div className="md:col-span-2 bg-white/40 p-8 rounded-3xl border border-white/20 shadow-sm text-center space-y-6">
          <p className="text-gray-600 font-medium">
            Feeling a little lighter? Good. One more sweet thing coming your way soon… but only when exams are done. 💌
          </p>
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl"
            >
              😴
            </motion.div>
            <p className="text-xs text-gray-400 italic">I'll be right here, Molka.</p>
            <button
              onClick={onFinish}
              className="mt-4 neon-button px-8 py-4 rounded-full font-bold text-white shadow-lg transition-all flex items-center gap-2 group"
            >
              See our memories together 💕 <Heart className="w-4 h-4 text-white group-hover:scale-125 transition-transform" />
            </button>
          </div>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto mt-12 text-center text-xs text-gray-500 opacity-60 pb-8">
        Made just for Molka. No exams were harmed. Just stress. You've got this.
      </footer>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'STUDY_BREAK' | 'PROPOSAL'>('STUDY_BREAK');
  const [step, setStep] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [studyBuddy, setStudyBuddy] = useState("");
  const [isFinalAsk, setIsFinalAsk] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [showWaitMessage, setShowWaitMessage] = useState(false);
  const [actuallyYes, setActuallyYes] = useState(false);

  const handleQuizStep = (correct: boolean, nextStep: number, message: string) => {
    if (correct) {
      setFeedback("");
      setStep(nextStep);
    } else {
      setFeedback(message);
      playSadSound();
      setTimeout(() => setFeedback(""), 2000);
    }
  };

  const handleStudyBuddyChange = (val: string) => {
    setStudyBuddy(val);
    const lower = val.toLowerCase();
    if (lower === "you" || lower === "molka" || lower.length > 3) {
      if (lower === "you" || lower === "molka") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffb38e', '#a8d8ea', '#ffd1dc']
        });
        setTimeout(() => setIsFinalAsk(true), 1500);
      }
    }
  };

  const handleYes = () => {
    setIsAccepted(true);
    playHappyMelody();
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#ffb38e', '#a8d8ea', '#ffd1dc', '#ff0000']
    });
  };

  const handleNotYet = () => {
    playSadSound();
    setShowWaitMessage(true);
    setTimeout(() => {
      setShowWaitMessage(false);
      setActuallyYes(true);
    }, 5000);
  };

  if (view === 'STUDY_BREAK') {
    return <StudyBreakCorner onFinish={() => setView('PROPOSAL')} />;
  }

  return (
    <div className="min-h-screen album-scene p-6 md:p-12 font-rounded overflow-x-hidden">
      {/* Cozy room elements */}
      <div className="album-room-overlay"></div>
      
      {/* Soft lamp light */}
      <div className="lamp-glow"></div>

      {/* Coffee cup on the table */}
      <div className="coffee-cup"></div>
      <div className="coffee-steam">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto z-10 mt-12 mb-12 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key="memory-album"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full space-y-8"
          >
            {/* Back Button */}
            <div className="text-center">
              <button
                onClick={() => setView('STUDY_BREAK')}
                className="neon-button px-6 py-3 rounded-full font-bold text-white shadow-lg transition-all flex items-center gap-2 mx-auto"
              >
                ← Back to Study Break
              </button>
            </div>

            {/* Physical Album Book */}
            <div className="album-book max-w-4xl mx-auto">
              {/* Album Cover */}
              <div className="album-cover">
                <div className="album-spine"></div>
                <div className="album-cover-front">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    💕
                  </motion.div>
                  <h2 className="text-3xl md:text-4xl font-hand font-bold text-amber-100 album-title">
                    Our Story Together
                  </h2>
                  <p className="text-sm font-rounded text-amber-200/70 mt-2">Molka & Me</p>
                </div>
              </div>

              {/* Album Pages */}
              <div className="album-pages">
                {/* Left Page */}
                <div className="album-page album-page-left">
                  <motion.div
                    initial={{ rotate: -2, y: 20 }}
                    animate={{ rotate: -2, y: 0 }}
                    whileHover={{ rotate: 0, scale: 1.05 }}
                    className="polaroid-card bg-white p-4 rounded-lg shadow-xl cursor-pointer"
                  >
                    <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 rounded flex items-center justify-center mb-3 relative overflow-hidden polaroid-photo">
                      <img 
                        src="/my-baby/photo1.jpeg" 
                        alt="Our Memory" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden absolute inset-0 flex items-center justify-center text-6xl">
                        💝
                      </div>
                    </div>
                    <p className="text-center font-hand text-xl text-gray-700">
                      Midnight Club Date
                    </p>
                  </motion.div>
                </div>

                {/* Right Page */}
                <div className="album-page album-page-right">
                  <motion.div
                    initial={{ rotate: 2, y: 20 }}
                    animate={{ rotate: 2, y: 0 }}
                    whileHover={{ rotate: 0, scale: 1.05 }}
                    className="polaroid-card bg-white p-4 rounded-lg shadow-xl cursor-pointer"
                  >
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-cyan-100 rounded flex items-center justify-center mb-3 relative overflow-hidden polaroid-photo">
                      <img 
                        src="/my-baby/photo2.jpeg" 
                        alt="Our Memory" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden absolute inset-0 flex items-center justify-center text-6xl">
                        🌟
                      </div>
                    </div>
                    <p className="text-center font-hand text-xl text-gray-700">
                      Midnight Club Date
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Floating Hearts */}
            <div className="flex justify-center gap-4 mt-8">
              {[1, 2, 3, 4, 5].map(i => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                  className="text-2xl"
                >
                  {i % 2 === 0 ? "💕" : "🐾"}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mt-auto py-8 text-center space-y-2 z-10 opacity-60">
        <p className="font-mono text-xs">
          Made with love for Molka 💖
          <br />
          Every day with you is a new adventure 🐱
        </p>
        <div className="flex justify-center gap-4">
          <Music className="w-4 h-4" />
          <Heart className="w-4 h-4 fill-current text-pink-400" />
        </div>
      </footer>
    </div>
  );
}
