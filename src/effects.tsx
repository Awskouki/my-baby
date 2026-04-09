import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Floating Particles Component
export const FloatingParticles = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Reduce particles on mobile
  const particles = isMobile 
    ? ['💖', '⭐', '✨', '💫', '🐾']
    : ['💖', '⭐', '✨', '💫', '🌟', '💝', '🐾', '💕', '⭐', '✨'];
  
  return (
    <div className="floating-particles">
      {particles.map((particle, i) => (
        <div key={i} className="particle">
          {particle}
        </div>
      ))}
    </div>
  );
};

// Paw Cursor Trail Component
export const PawCursorTrail = () => {
  const [paws, setPaws] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if device is mobile/touch
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    // Don't run on mobile devices
    if (isMobile) return;

    let pawId = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      const id = pawId++;
      setPaws(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      
      setTimeout(() => {
        setPaws(prev => prev.filter(p => p.id !== id));
      }, 1500);
    };

    // Throttle to avoid too many paws
    let lastPaw = 0;
    const throttledMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastPaw > 100) {
        lastPaw = now;
        handleMouseMove(e);
      }
    };

    window.addEventListener('mousemove', throttledMouseMove);
    return () => window.removeEventListener('mousemove', throttledMouseMove);
  }, [isMobile]);

  return (
    <>
      {paws.map(paw => (
        <div
          key={paw.id}
          className="paw-trail"
          style={{ left: paw.x, top: paw.y }}
        >
          🐾
        </div>
      ))}
    </>
  );
};

// Toast Notification Component
interface ToastProps {
  id: number;
  icon: string;
  title: string;
  message: string;
  onClose: (id: number) => void;
}

const Toast = ({ id, icon, title, message, onClose }: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(id), 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className={`toast-notification ${isExiting ? 'toast-exit' : ''}`}>
      <div className="toast-icon">{icon}</div>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        <div className="toast-message">{message}</div>
      </div>
      <button 
        className="toast-close" 
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose(id), 300);
        }}
      >
        ×
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<Array<{ id: number; icon: string; title: string; message: string }>>([]);

  useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      const { icon, title, message } = event.detail;
      const id = Date.now();
      setToasts(prev => [...prev, { id, icon, title, message }]);
    };

    window.addEventListener('showToast' as any, handleToast);
    return () => window.removeEventListener('showToast' as any, handleToast);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>
  );
};

// Helper function to show toast
export const showToast = (icon: string, title: string, message: string) => {
  const event = new CustomEvent('showToast', {
    detail: { icon, title, message }
  });
  window.dispatchEvent(event);
};

// Sparkle on Click Component
export const ClickSparkles = () => {
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    let sparkleId = 0;
    
    const handleClick = (e: MouseEvent) => {
      const id = sparkleId++;
      setSparkles(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== id));
      }, 1000);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <>
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="sparkle"
          style={{ left: sparkle.x, top: sparkle.y }}
        >
          ✨
        </div>
      ))}
    </>
  );
};
