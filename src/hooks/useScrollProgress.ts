import { useEffect, useState } from 'react';

export type ScrollSnapshot = {
  progress: number;
  activeProject: number;
  activeStage: number;
};

export function useScrollProgress(sectionCount: number, projectCount = 3) {
  const [snapshot, setSnapshot] = useState<ScrollSnapshot>({
    progress: 0,
    activeProject: -1,
    activeStage: 0
  });

  useEffect(() => {
    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const progress = Math.min(Math.max(window.scrollY / max, 0), 1);
        const projectStart = 0.64;
        const projectEnd = 0.9;
        const projectSpan = (projectEnd - projectStart) / Math.max(projectCount, 1);
        const activeProject =
          progress > projectStart && progress < projectEnd
            ? Math.min(projectCount - 1, Math.floor((progress - projectStart) / projectSpan))
            : -1;

        setSnapshot({
          progress,
          activeProject,
          activeStage: Math.min(sectionCount - 1, Math.floor(progress * sectionCount))
        });
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [projectCount, sectionCount]);

  return snapshot;
}
