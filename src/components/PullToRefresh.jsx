import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const PULL_THRESHOLD = 70;

export default function PullToRefresh({ onRefresh, children }) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, PULL_THRESHOLD], [0, 1]);
  const rotate = useTransform(y, [0, PULL_THRESHOLD], [0, 180]);
  const scale = useTransform(y, [0, PULL_THRESHOLD], [0.5, 1]);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      y.set(Math.min(delta * 0.5, PULL_THRESHOLD + 20));
    }
  }, [refreshing, y]);

  const handleTouchEnd = useCallback(async () => {
    if (startY.current === null) return;
    startY.current = null;
    if (y.get() >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      animate(y, PULL_THRESHOLD, { duration: 0.1 });
      await onRefresh();
      setRefreshing(false);
    }
    animate(y, 0, { duration: 0.3, ease: 'easeOut' });
  }, [y, refreshing, onRefresh]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <motion.div
        style={{ opacity, y: useTransform(y, v => v - 40) }}
        className="absolute top-0 left-0 right-0 flex justify-center z-10 pointer-events-none"
      >
        <motion.div style={{ scale }} className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center">
          <motion.div style={{ rotate }}>
            <RefreshCw className={`h-4 w-4 text-secondary ${refreshing ? 'animate-spin' : ''}`} />
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}