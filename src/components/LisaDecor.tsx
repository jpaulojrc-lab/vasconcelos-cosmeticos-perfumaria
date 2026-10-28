import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Heart } from 'lucide-react';

const HEARTS = [
  { left: '58px', delay: 0.2, color: 'text-rose-400', size: 12 },
  { left: '78px', delay: 0.5, color: 'text-amber-300', size: 10 },
  { left: '66px', delay: 0.8, color: 'text-rose-300', size: 14 },
  { left: '92px', delay: 1.1, color: 'text-amber-400', size: 10 },
];

/**
 * Alguns corações que sobem e somem uma única vez ao montar.
 * Posicionado de forma absoluta: o pai precisa ser `relative`.
 */
export const FloatingHearts: React.FC = () => {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {HEARTS.map((h, i) => (
        <motion.span
          key={i}
          className={`absolute ${h.color}`}
          style={{ left: h.left, top: '70%' }}
          initial={{ y: 0, opacity: 0, scale: 0.6 }}
          animate={{ y: -46, opacity: [0, 1, 0], scale: 1 }}
          transition={{ duration: 1.6, delay: h.delay, ease: 'easeOut' }}
        >
          <Heart style={{ width: h.size, height: h.size }} fill="currentColor" />
        </motion.span>
      ))}
    </div>
  );
};

/**
 * Balãozinho "au au! 🐾" que aparece e some sozinho, uma vez por montagem.
 * Posicionado de forma absoluta acima do pai, que precisa ser `relative`/`fixed`.
 */
export const PawBubble: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const showTimer = setTimeout(() => setVisible(true), 1000);
    const hideTimer = setTimeout(() => setVisible(false), 5000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.9 }}
          transition={{ type: 'spring', damping: 18, stiffness: 260 }}
          className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-2xl rounded-br-sm border border-amber-300 bg-white px-3 py-1.5 text-[11px] font-bold text-neutral-900 shadow-lg"
          aria-hidden="true"
        >
          au au! 🐾
        </motion.div>
      )}
    </AnimatePresence>
  );
};
