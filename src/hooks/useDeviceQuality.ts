import { useEffect, useMemo, useState } from 'react';

export type DeviceQuality = {
  isMobile: boolean;
  dpr: number;
  neuronCount: number;
  particleCount: number;
  connectionCount: number;
  bloomLikeIntensity: number;
};

export function useDeviceQuality(reducedMotion: boolean): DeviceQuality {
  const [width, setWidth] = useState(() => window.innerWidth);
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    let frames = 0;
    let last = performance.now();
    let raf = 0;

    const sample = (now: number) => {
      frames += 1;
      if (now - last > 2200) {
        const fps = (frames * 1000) / (now - last);
        if (fps < 42) setDegraded(true);
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(sample);
    };

    raf = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  return useMemo(() => {
    const isMobile = width < 760;
    const low = isMobile || degraded || reducedMotion;

    return {
      isMobile,
      dpr: low ? 1 : Math.min(window.devicePixelRatio, 1.75),
      neuronCount: low ? 32 : 96,
      particleCount: low ? 2400 : 10000,
      connectionCount: low ? 64 : 210,
      bloomLikeIntensity: low ? 0.55 : 1
    };
  }, [degraded, reducedMotion, width]);
}
