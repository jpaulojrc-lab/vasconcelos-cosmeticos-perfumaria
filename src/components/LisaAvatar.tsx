import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export type LisaMood = 'idle' | 'listening';

export interface LisaAvatarProps {
  /** Lado do avatar em px. Padrão 40. */
  size?: number;
  /** 'listening' balança a cabecinha de leve (ouvindo). Padrão 'idle'. */
  mood?: LisaMood;
  /** Pulinho único ao montar. Padrão false. */
  hopOnMount?: boolean;
  /** Respiração suave em loop. Padrão false. */
  breathe?: boolean;
  /** Inclina a cabecinha ao passar o mouse. Padrão false. */
  tiltOnHover?: boolean;
  /** Classes extras no contêiner circular. */
  className?: string;
}

export const LisaAvatar: React.FC<LisaAvatarProps> = ({
  size = 40,
  mood = 'idle',
  hopOnMount = false,
  breathe = false,
  tiltOnHover = false,
  className = '',
}) => {
  const reduceMotion = useReducedMotion();
  const [imageFailed, setImageFailed] = useState(false);
  const motionOn = !reduceMotion;

  const animate: Record<string, number | number[]> = {};
  const transition: Record<string, object> = {};

  if (motionOn && breathe) {
    animate.scale = [1, 1.04, 1];
    transition.scale = { duration: 3, repeat: Infinity, ease: 'easeInOut' };
  }
  if (motionOn && mood === 'listening') {
    animate.rotate = [-6, 6, -6];
    transition.rotate = { duration: 1.2, repeat: Infinity, ease: 'easeInOut' };
  }
  if (motionOn && hopOnMount) {
    animate.y = [0, -8, 0];
    transition.y = { duration: 0.5, ease: 'easeOut' };
  }

  return (
    <motion.div
      initial={false}
      animate={animate}
      transition={transition}
      whileHover={motionOn && tiltOnHover ? { rotate: -8, scale: 1.06 } : undefined}
      className={`relative shrink-0 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-md bg-[#F6E3C5] ${className}`}
      style={{ width: size, height: size }}
    >
      {imageFailed ? (
        <div
          className="w-full h-full bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center font-bold text-white"
          style={{ fontSize: size * 0.42 }}
          aria-label="Lisa, a cachorrinha consultora"
        >
          L
        </div>
      ) : (
        <img
          src="/lisa.jpeg"
          alt="Lisa, a cachorrinha consultora"
          draggable={false}
          onError={() => setImageFailed(true)}
          className="w-full h-full object-cover select-none"
          style={{
            objectPosition: '40% 33%',
            transform: 'scale(1.5)',
            transformOrigin: '41% 50%',
          }}
        />
      )}
    </motion.div>
  );
};
