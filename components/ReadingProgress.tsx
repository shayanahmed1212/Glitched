'use client';

import { useEffect, useState } from 'react';

// Magazine chrome: a hairline of gold that tracks how far into the
// story you are. No transition — it should read as a needle, not a
// tween, and reduced-motion gets it for free.
export default function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    function update() {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setPct(max > 8 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-[3px] bg-paper/10">
      <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
    </div>
  );
}
