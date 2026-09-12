import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { type SceneState } from '../ScrollExperience/sceneState';
import { NeuronSystem } from '../NeuronSystem/NeuronSystem';
import { NeuralConnections } from '../NeuralConnections/NeuralConnections';
import { NeuralSignalField } from '../NeuralSignalField/NeuralSignalField';
import { SceneLighting } from '../SceneLighting/SceneLighting';
import { LoadingScreen } from '../LoadingScreen/LoadingScreen';
import { type Project } from '../../data/content';
import { type DeviceQuality } from '../../hooks/useDeviceQuality';
import { siteConfig } from '../../data/siteConfig';

type NeuralCanvasProps = {
  sceneState: React.MutableRefObject<SceneState>;
  quality: DeviceQuality;
  reducedMotion: boolean;
  loadingLabel: string;
  projects: readonly Project[];
};

function canUseWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function NeuralCanvas({ sceneState, quality, reducedMotion, loadingLabel, projects }: NeuralCanvasProps) {
  const [ready, setReady] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setWebgl(canUseWebGL());
  }, []);

  useEffect(() => {
    const loadingTimer = window.setTimeout(() => setLoadingComplete(true), reducedMotion ? 0 : 2600);
    return () => window.clearTimeout(loadingTimer);
  }, [reducedMotion]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  const clearColor = useMemo(() => siteConfig.colors.background, []);

  if (!webgl) {
    return (
      <div className="webglFallback" aria-hidden="true">
        <div />
        <span />
      </div>
    );
  }

  return (
    <>
      <div className="canvasShell" aria-hidden="true">
        <Canvas
          gl={{
            antialias: !quality.isMobile,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true
          }}
          dpr={[1, quality.dpr]}
          camera={{ position: [0, 1.3, 14], fov: quality.isMobile ? 54 : 46, near: 0.1, far: 80 }}
          onCreated={({ gl }) => {
            gl.setClearColor(clearColor, 1);
            setReady(true);
          }}
        >
          <Suspense fallback={null}>
            <SceneLighting reducedMotion={reducedMotion} />
            <NeuralSignalField sceneState={sceneState} quality={quality} reducedMotion={reducedMotion} />
            <NeuronSystem
              sceneState={sceneState}
              quality={quality}
              pointer={pointer}
              reducedMotion={reducedMotion}
              projects={projects}
            />
            <NeuralConnections sceneState={sceneState} quality={quality} reducedMotion={reducedMotion} />
            <Preload all />
          </Suspense>
        </Canvas>
      </div>
      {(!ready || !loadingComplete) && <LoadingScreen label={loadingLabel} />}
    </>
  );
}
