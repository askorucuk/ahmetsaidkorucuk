import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Suspense, lazy, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { PortfolioOverlay } from '../PortfolioOverlay/PortfolioOverlay';
import { createSceneState } from './sceneState';
import { useDeviceQuality } from '../../hooks/useDeviceQuality';
import { useLocale } from '../../hooks/useLocale';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useScrollProgress } from '../../hooks/useScrollProgress';

gsap.registerPlugin(ScrollTrigger);

const NeuralCanvas = lazy(() =>
  import('../NeuralCanvas/NeuralCanvas').then((module) => ({ default: module.NeuralCanvas }))
);

export function ScrollExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneState = useRef(createSceneState());
  const reducedMotion = useReducedMotion();
  const quality = useDeviceQuality(reducedMotion);
  const { content, locale, setLocale } = useLocale();
  const snapshot = useScrollProgress(12, content.projects.length);

  const projectTargets = useMemo(
    () => [
      { cameraX: -2.2, cameraY: 0.65, cameraZ: 10.2, focusX: -2.9, focusY: 0.2, focusZ: 0 },
      { cameraX: 1.8, cameraY: 0.85, cameraZ: 10.4, focusX: 2.1, focusY: 0.45, focusZ: 0 },
      { cameraX: 0.25, cameraY: -0.1, cameraZ: 10.1, focusX: 0.2, focusY: -0.2, focusZ: 0 },
      { cameraX: 2.75, cameraY: -0.5, cameraZ: 10.9, focusX: 3.0, focusY: -1.1, focusZ: 0 },
      { cameraX: -1.8, cameraY: -0.55, cameraZ: 10.8, focusX: -1.25, focusY: -1.15, focusZ: 0 }
    ],
    []
  );

  useEffect(() => {
    sceneState.current.activeProject = snapshot.activeProject;

    if (snapshot.activeProject >= 0) {
      const target = projectTargets[snapshot.activeProject] ?? projectTargets[0];
      sceneState.current.cameraX = target.cameraX;
      sceneState.current.cameraY = target.cameraY;
      sceneState.current.cameraZ = target.cameraZ;
      sceneState.current.focusX = target.focusX;
      sceneState.current.focusY = target.focusY;
      sceneState.current.focusZ = target.focusZ;
      sceneState.current.projectFocus = 1;
      sceneState.current.dimNetwork = 0.24;
    }
  }, [projectTargets, snapshot.activeProject]);

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      syncTouch: false
    });

    const onScroll = () => ScrollTrigger.update();
    const tick = (time: number) => lenis.raf(time * 1000);

    lenis.on('scroll', onScroll);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.off('scroll', onScroll);
      lenis.destroy();
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    let interrupted = false;
    let autoScrollFrame = 0;
    const interrupt = () => {
      interrupted = true;
      cancelAnimationFrame(autoScrollFrame);
    };
    const interactionEvents: Array<keyof WindowEventMap> = ['wheel', 'touchstart', 'pointerdown', 'keydown'];

    interactionEvents.forEach((eventName) => window.addEventListener(eventName, interrupt, { passive: true }));

    const autoScrollTimer = window.setTimeout(() => {
      if (interrupted || window.scrollY > 4) return;

      const start = window.scrollY;
      const target = Math.min(Math.round(window.innerHeight * 0.58), document.documentElement.scrollHeight - window.innerHeight);
      const duration = 1600;
      const startedAt = performance.now();
      const easeInOut = (value: number) =>
        value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

      const step = (now: number) => {
        if (interrupted) return;

        const progress = Math.min((now - startedAt) / duration, 1);
        window.scrollTo(0, start + (target - start) * easeInOut(progress));

        if (progress < 1) {
          autoScrollFrame = requestAnimationFrame(step);
        }
      };

      autoScrollFrame = requestAnimationFrame(step);
    }, 5000);

    return () => {
      cancelAnimationFrame(autoScrollFrame);
      window.clearTimeout(autoScrollTimer);
      interactionEvents.forEach((eventName) => window.removeEventListener(eventName, interrupt));
    };
  }, [reducedMotion]);

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    if (reducedMotion) {
      Object.assign(sceneState.current, {
        cellBirth: 1,
        cellAwake: 1,
        neuronMorph: 1,
        connectionGrow: 1,
        networkForm: 1,
        finale: 1,
        growthFront: 1,
        cameraZ: quality.isMobile ? 15 : 13,
        cameraY: 0.6
      });
      return;
    }

    const ctx = gsap.context(() => {
      const state = sceneState.current;
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.9
        }
      });

      timeline
        .to(state, {
          growthFront: 0.1,
          cellBirth: 0.55,
          cameraX: quality.isMobile ? -1.6 : -3.1,
          cameraY: quality.isMobile ? -0.35 : -0.75,
          cameraZ: quality.isMobile ? 10.8 : 8.4,
          focusX: -4.2,
          focusY: -1.25,
          duration: 1
        })
        .to(state, {
          growthFront: 0.22,
          cellBirth: 1,
          neuronMorph: 0.35,
          cameraX: quality.isMobile ? -1.15 : -2.35,
          cameraY: quality.isMobile ? -0.15 : -0.45,
          cameraZ: quality.isMobile ? 10.2 : 7.9,
          focusX: -2.9,
          focusY: -0.9,
          duration: 1.2
        })
        .to(state, {
          growthFront: 0.34,
          neuronMorph: 0.55,
          connectionGrow: 0.28,
          cameraX: quality.isMobile ? -0.65 : -1.4,
          cameraY: 0.05,
          cameraZ: quality.isMobile ? 9.8 : 7.6,
          focusX: -1.15,
          focusY: -0.2,
          duration: 1.2
        })
        .to(state, {
          growthFront: 0.42,
          connectionGrow: 0.42,
          cameraX: quality.isMobile ? -0.2 : -0.45,
          cameraY: 0.12,
          focusX: 0.25,
          focusY: 0.02,
          duration: 0.8
        })
        .to(state, {
          growthFront: 0.57,
          neuronMorph: 0.78,
          connectionGrow: 0.58,
          cameraX: quality.isMobile ? 0.35 : 0.8,
          cameraY: 0.48,
          cameraZ: quality.isMobile ? 10.3 : 8.2,
          focusX: 1.65,
          focusY: 0.75,
          duration: 1.5
        })
        .to(state, {
          growthFront: 0.72,
          connectionGrow: 0.74,
          networkForm: 0.62,
          cameraX: quality.isMobile ? 0.55 : 1.4,
          cameraY: -0.15,
          cameraZ: quality.isMobile ? 11.4 : 9.3,
          focusX: 2.8,
          focusY: -0.7,
          duration: 1.5
        })
        .to(state, {
          growthFront: 0.88,
          connectionGrow: 0.92,
          networkForm: 0.9,
          cameraX: 0.2,
          cameraY: 0.25,
          cameraZ: quality.isMobile ? 13.4 : 11.4,
          focusX: 0.8,
          focusY: 0,
          duration: 1.45
        })
        .to(state, { growthFront: 1, connectionGrow: 1, networkForm: 1, projectFocus: 1, dimNetwork: 0.55, duration: 1.1 })
        .to(state, { cameraZ: quality.isMobile ? 15.5 : 14.2, projectFocus: 0.45, duration: 1.1 })
        .to(state, {
          finale: 1,
          growthFront: 1,
          dimNetwork: 0,
          projectFocus: 0,
          cameraX: 0,
          cameraY: 0.35,
          cameraZ: quality.isMobile ? 17 : 15.8,
          focusX: 0,
          focusY: 0,
          focusZ: 0,
          duration: 1
        });
    }, rootRef);

    return () => ctx.revert();
  }, [quality.isMobile, reducedMotion]);

  return (
    <div ref={rootRef} className="experience">
      <Suspense fallback={<div className="canvasShell canvasPlaceholder" aria-hidden="true" />}>
        <NeuralCanvas
          sceneState={sceneState}
          quality={quality}
          reducedMotion={reducedMotion}
          loadingLabel={content.ui.loadingLabel}
          projects={content.projects}
        />
      </Suspense>
      <PortfolioOverlay content={content} locale={locale} setLocale={setLocale} snapshot={snapshot} />
    </div>
  );
}
