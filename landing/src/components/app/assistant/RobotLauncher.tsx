'use client';

import {
  AnimatePresence,
  motion,
  type MotionValue,
  useAnimationControls,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type RefObject, useEffect, useId, useRef, useState } from 'react';
import { useFinePointer } from '@/hooks/useFinePointer';
import { EASE_OUT } from '@/lib/motion';
import { cn } from '@/lib/utils';

export type RobotContext = 'landing' | 'calcs' | 'check' | 'estimate' | 'default';

type Mood = 'idle' | 'happy' | 'excited' | 'sleepy';

const EYE_TRAVEL = 2.4;
const HEAD_TILT = 9;
const LOOK_RADIUS = 260;
const EXCITED_RADIUS = 130;
const BLINK_MIN_MS = 2600;
const BLINK_MAX_MS = 5200;
const GLANCE_AFTER_MS = 6000;
const GLANCE_EVERY_MS = 1700;
const SLEEP_AFTER_MS = 25_000;
const GREETING_DELAY_MS = 4500;
const GREETING_VISIBLE_MS = 9000;
const OPEN_DELAY_MS = 260;
const GREETING_KEY = 'narxla-robot-greeted';
const SPRING = { stiffness: 220, damping: 18, mass: 0.5 };

const MOUTH: Record<Mood, string> = {
  idle: 'M15.8 21.3 Q18 22.3 20.2 21.3',
  happy: 'M15.2 20.9 Q18 23.7 20.8 20.9',
  excited: 'M16.1 20.7 Q18 23.9 19.9 20.7',
  sleepy: 'M16.6 21.7 Q18 22 19.4 21.7',
};

const EYE_SCALE: Record<Mood, { scaleX: number; scaleY: number }> = {
  idle: { scaleX: 1, scaleY: 1 },
  happy: { scaleX: 1.05, scaleY: 0.8 },
  excited: { scaleX: 1.25, scaleY: 1.25 },
  sleepy: { scaleX: 1.1, scaleY: 0.16 },
};

function readGreeted() {
  try {
    return sessionStorage.getItem(GREETING_KEY) === '1';
  } catch {
    return true;
  }
}

function markGreeted() {
  try {
    sessionStorage.setItem(GREETING_KEY, '1');
  } catch {}
}

function useRobotSenses(target: RefObject<HTMLElement | null>, enabled: boolean) {
  const lookX = useMotionValue(0);
  const lookY = useMotionValue(0);
  const x = useSpring(lookX, SPRING);
  const y = useSpring(lookY, SPRING);
  const [near, setNear] = useState(false);
  const [sleeping, setSleeping] = useState(false);
  const [startled, setStartled] = useState(0);
  const lastActive = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    lastActive.current = performance.now();
    let frame = 0;
    let pointer: { x: number; y: number } | null = null;
    let sleepingNow = false;

    const wake = () => {
      lastActive.current = performance.now();
      if (sleepingNow) {
        sleepingNow = false;
        setSleeping(false);
        setStartled((count) => count + 1);
      }
    };

    const update = () => {
      frame = 0;
      const element = target.current;
      if (!element || !pointer) return;
      const rect = element.getBoundingClientRect();
      const dx = pointer.x - (rect.left + rect.width / 2);
      const dy = pointer.y - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy);
      const strength = Math.min(1, distance / LOOK_RADIUS);
      const angle = Math.atan2(dy, dx);
      lookX.set(Math.cos(angle) * strength);
      lookY.set(Math.sin(angle) * strength);
      setNear(distance < EXCITED_RADIUS);
    };

    const onMove = (event: PointerEvent) => {
      wake();
      pointer = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(update);
    };

    const tick = setInterval(() => {
      const idleFor = performance.now() - lastActive.current;
      if (idleFor > SLEEP_AFTER_MS && !sleepingNow) {
        sleepingNow = true;
        setSleeping(true);
        setNear(false);
        lookX.set(0);
        lookY.set(0.5);
      } else if (idleFor > GLANCE_AFTER_MS && !sleepingNow) {
        lookX.set(Math.random() * 2 - 1);
        lookY.set(Math.random() * 1.4 - 0.7);
      }
    }, GLANCE_EVERY_MS);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('keydown', wake);
    window.addEventListener('scroll', wake, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('keydown', wake);
      window.removeEventListener('scroll', wake);
      clearInterval(tick);
      cancelAnimationFrame(frame);
    };
  }, [enabled, target, lookX, lookY]);

  return { x, y, near, sleeping, startled };
}

function useBlink(enabled: boolean) {
  const controls = useAnimationControls();

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(async () => {
        await controls.start({ scaleY: [1, 0.1, 1], transition: { duration: 0.22, times: [0, 0.45, 1] } });
        if (Math.random() < 0.25) await controls.start({ scaleY: [1, 0.1, 1], transition: { duration: 0.2 } });
        schedule();
      }, BLINK_MIN_MS + Math.random() * (BLINK_MAX_MS - BLINK_MIN_MS));
    };
    schedule();
    return () => clearTimeout(timer);
  }, [enabled, controls]);

  return controls;
}

type EyeProps = {
  cx: number;
  mood: Mood;
  glow: string;
  blink: ReturnType<typeof useAnimationControls>;
  x: MotionValue<number>;
  y: MotionValue<number>;
};

const EYE_CY = 16.2;

function Eye({ cx, mood, glow, blink, x, y }: EyeProps) {
  return (
    <motion.g style={{ x, y }}>
      <motion.g
        animate={EYE_SCALE[mood]}
        transition={{ type: 'spring', stiffness: 380, damping: 18 }}
        style={{ transformOrigin: `${cx}px ${EYE_CY}px` }}
      >
        <motion.rect
          x={cx - 1.8}
          y={EYE_CY - 2.6}
          width="3.6"
          height="5.2"
          rx="1.8"
          fill="#FFC15C"
          filter={`url(#${glow})`}
          animate={mood === 'sleepy' ? undefined : blink}
          style={{ transformOrigin: `${cx}px ${EYE_CY}px` }}
        />
        <circle cx={cx + 0.55} cy={EYE_CY - 1.1} r={mood === 'excited' ? 0.85 : 0.6} fill="#FFF8EA" opacity="0.9" />
      </motion.g>
    </motion.g>
  );
}

type RobotLauncherProps = {
  label: string;
  context: RobotContext;
  onOpen: () => void;
  className?: string;
};

export function RobotLauncher({ label, context, onOpen, className }: RobotLauncherProps) {
  const t = useTranslations('app.assistant');
  const reducedMotion = Boolean(useReducedMotion());
  const finePointer = useFinePointer();
  const button = useRef<HTMLButtonElement>(null);
  const uid = `robot${useId().replace(/:/g, '')}`;
  const body = useAnimationControls();
  const [hovered, setHovered] = useState(false);
  const [greeting, setGreeting] = useState(false);
  const [opening, setOpening] = useState(false);

  const senses = useRobotSenses(button, finePointer && !reducedMotion);
  const blink = useBlink(!reducedMotion);
  const eyeX = useTransform(senses.x, (value) => value * EYE_TRAVEL);
  const eyeY = useTransform(senses.y, (value) => value * EYE_TRAVEL);
  const tilt = useTransform(senses.x, (value) => value * HEAD_TILT);

  const mood: Mood = opening || hovered || greeting ? 'happy' : senses.near ? 'excited' : senses.sleeping ? 'sleepy' : 'idle';

  useEffect(() => {
    if (readGreeted()) return;
    const show = setTimeout(() => setGreeting(true), GREETING_DELAY_MS);
    const hide = setTimeout(() => setGreeting(false), GREETING_DELAY_MS + GREETING_VISIBLE_MS);
    markGreeted();
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  useEffect(() => {
    if (senses.startled === 0 || reducedMotion) return;
    void body.start({ y: [0, -7, 0, -2, 0], rotate: [0, -8, 6, 0], transition: { duration: 0.6, ease: 'easeOut' } });
  }, [senses.startled, reducedMotion, body]);

  const open = () => {
    setGreeting(false);
    if (reducedMotion) return onOpen();
    setOpening(true);
    void body.start({ y: [0, -10, 0], scale: [1, 1.12, 0.96, 1], transition: { duration: 0.32, ease: 'easeOut' } });
    setTimeout(onOpen, OPEN_DELAY_MS);
  };

  return (
    <div
      className={cn(
        'fixed right-4 bottom-[calc(16px+env(safe-area-inset-bottom))] z-70 flex items-end gap-3 md:right-6 md:bottom-6',
        className,
      )}
    >
      <AnimatePresence>
        {greeting && (
          <motion.div
            initial={{ opacity: 0, x: 12, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.95 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="relative mb-2 max-w-[230px] origin-bottom-right rounded-2xl rounded-br-md border border-line-2 bg-surface py-2.5 pr-8 pl-3.5 text-left text-[13px]/[18px] text-fg shadow-(--shadow-elev)"
          >
            <button type="button" onClick={open} className="text-left font-medium">
              {t(`hello.${context}`)}
            </button>
            <button
              type="button"
              aria-label={t('dismiss')}
              onClick={() => setGreeting(false)}
              className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full text-fg-3 transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <X size={13} strokeWidth={2} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={button}
        type="button"
        aria-label={label}
        title={label}
        onClick={open}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        initial={reducedMotion ? false : { opacity: 0, scale: 0.4, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: 10 }}
        whileHover={reducedMotion ? undefined : { scale: 1.06 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
        className="group relative grid size-[60px] shrink-0 place-items-center rounded-full outline-offset-4"
      >
        {!reducedMotion && (
          <>
            <span
              className={cn(
                'absolute inset-0 animate-ping rounded-full bg-accent/20 transition-opacity duration-500',
                mood === 'sleepy' && 'opacity-0',
              )}
              style={{ animationDuration: mood === 'excited' ? '1.4s' : '3s' }}
              aria-hidden
            />
            <span
              className="absolute -inset-1.5 animate-spin rounded-full bg-[conic-gradient(from_0deg,transparent,var(--accent),transparent_40%)] opacity-0 blur-[6px] transition-opacity duration-300 [animation-duration:2.4s] group-hover:opacity-70"
              aria-hidden
            />
          </>
        )}

        <motion.span
          animate={body}
          className="relative grid size-[60px] place-items-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_30%_22%,#FFD48A,var(--accent)_52%,#C97A12)] shadow-[0_12px_32px_-8px_var(--glow),0_4px_14px_rgba(0,0,0,.35),inset_0_-3px_6px_rgba(0,0,0,.12)]"
          aria-hidden
        >
          <motion.svg
            width="44"
            height="44"
            viewBox="0 0 36 36"
            fill="none"
            style={{ rotate: tilt }}
            animate={reducedMotion ? undefined : { y: mood === 'sleepy' ? [0.8, 1.6, 0.8] : [0, -1.5, 0] }}
            transition={{ duration: mood === 'sleepy' ? 4 : 3.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <defs>
              <linearGradient id={`${uid}-head`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FFFDF8" />
                <stop offset="1" stopColor="#F1E2C8" />
              </linearGradient>
              <linearGradient id={`${uid}-ear`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#F6EAD6" />
                <stop offset="1" stopColor="#D9C4A0" />
              </linearGradient>
              <linearGradient id={`${uid}-visor`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2E2416" />
                <stop offset="1" stopColor="#140E06" />
              </linearGradient>
              <filter id={`${uid}-glow`} x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="0.9" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id={`${uid}-shadow`} x="-30%" y="-30%" width="160%" height="170%">
                <feDropShadow dx="0" dy="1.2" stdDeviation="1" floodColor="#7A4708" floodOpacity="0.35" />
              </filter>
            </defs>

            <motion.g
              animate={mood === 'excited' && !reducedMotion ? { rotate: [-12, 12, -12] } : { rotate: 0 }}
              transition={mood === 'excited' ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
              style={{ transformOrigin: '18px 7.5px' }}
            >
              <rect x="17.2" y="3.6" width="1.6" height="4.6" rx="0.8" fill={`url(#${uid}-ear)`} />
              <motion.circle
                cx="18"
                cy="3.2"
                r="2"
                fill={mood === 'sleepy' ? '#B9A27C' : mood === 'excited' ? '#FFF1D2' : '#FFB240'}
                filter={mood === 'sleepy' ? undefined : `url(#${uid}-glow)`}
                animate={reducedMotion || mood === 'sleepy' ? { opacity: 0.8 } : { opacity: [1, 0.55, 1], scale: [1, 1.15, 1] }}
                transition={{ duration: mood === 'excited' ? 0.6 : 1.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '18px 3.2px' }}
              />
            </motion.g>

            <g filter={`url(#${uid}-shadow)`}>
              <rect x="3.6" y="13.6" width="3.4" height="8" rx="1.7" fill={`url(#${uid}-ear)`} />
              <rect x="29" y="13.6" width="3.4" height="8" rx="1.7" fill={`url(#${uid}-ear)`} />
              <rect x="6" y="7.6" width="24" height="22" rx="8.5" fill={`url(#${uid}-head)`} />
            </g>
            <ellipse cx="12.4" cy="10.2" rx="3.6" ry="1.3" fill="#FFFFFF" opacity="0.75" />

            <rect x="8.6" y="10.6" width="18.8" height="13.6" rx="5.6" fill={`url(#${uid}-visor)`} />
            <path d="M10.4 12.6 Q13 11.4 16.4 11.6" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="1" strokeLinecap="round" fill="none" />

            <Eye cx={14.2} mood={mood} glow={`${uid}-glow`} blink={blink} x={eyeX} y={eyeY} />
            <Eye cx={21.8} mood={mood} glow={`${uid}-glow`} blink={blink} x={eyeX} y={eyeY} />
            <motion.path
              d={MOUTH.idle}
              stroke="#FFC15C"
              strokeWidth="1.3"
              strokeLinecap="round"
              fill="none"
              filter={`url(#${uid}-glow)`}
              animate={{ d: MOUTH[mood] }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
            />

            <motion.g animate={{ opacity: mood === 'happy' || mood === 'excited' ? 0.7 : 0.25 }} transition={{ duration: 0.3 }}>
              <ellipse cx="10.2" cy="26.4" rx="1.6" ry="1" fill="#F2876A" />
              <ellipse cx="25.8" cy="26.4" rx="1.6" ry="1" fill="#F2876A" />
            </motion.g>
          </motion.svg>
        </motion.span>

        <AnimatePresence>
          {mood === 'sleepy' && !reducedMotion && (
            <motion.span key="zzz" className="pointer-events-none absolute -top-2 right-0" exit={{ opacity: 0 }} aria-hidden>
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={index}
                  className="absolute font-display font-bold text-accent-text"
                  style={{ fontSize: 10 + index * 3 }}
                  initial={{ opacity: 0, x: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 0], x: [0, 6 + index * 4], y: [0, -14 - index * 6] }}
                  transition={{ duration: 2.4, delay: index * 0.7, repeat: Infinity, ease: 'easeOut' }}
                >
                  z
                </motion.span>
              ))}
            </motion.span>
          )}
        </AnimatePresence>

        <span
          className={cn(
            'absolute top-0.5 right-0.5 size-3.5 rounded-full border-[2.5px] border-bg transition-colors duration-500',
            mood === 'sleepy' ? 'bg-fg-3' : 'bg-success',
          )}
          aria-hidden
        />
      </motion.button>
    </div>
  );
}
