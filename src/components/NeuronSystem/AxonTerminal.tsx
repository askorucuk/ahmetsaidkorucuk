import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { type ActivationSchedule, type BranchPath } from '../../data/neuralField';
import { type SceneState } from '../ScrollExperience/sceneState';
import { createGrowthMaterial, createTaperedTubeGeometry } from './geometry';
import { linearProgressInRange } from './NeuralNetworkManager';

type AxonTerminalProps = {
  terminal: BranchPath;
  schedule: ActivationSchedule;
  palette: number;
  sceneState: React.MutableRefObject<SceneState>;
  reducedMotion: boolean;
  dim: number;
};

export function AxonTerminal({ terminal, schedule, palette, sceneState, reducedMotion, dim }: AxonTerminalProps) {
  const mesh = useMemo(() => ({ ref: { current: null as THREE.Mesh | null } }), []);
  const endRef = useMemo(() => ({ current: null as THREE.Mesh | null }), []);
  const geometry = useMemo(
    () => createTaperedTubeGeometry(terminal.points, terminal.radiusStart, terminal.radiusEnd, 14, 6),
    [terminal]
  );
  const material = useMemo(
    () =>
      createGrowthMaterial(
        ['#d2fbff', '#c8d4ff', '#c7fff4', '#e0d9ff'][palette],
        ['#62e5ff', '#8296ff', '#78f1de', '#b196ff'][palette],
        0,
        0
      ),
    [palette]
  );
  const end = terminal.points[terminal.points.length - 1];

  useFrame(() => {
    const progress = reducedMotion ? 1 : linearProgressInRange(sceneState.current.growthFront, schedule.axonStart, schedule.axonEnd);
    const draw = THREE.MathUtils.clamp((progress - terminal.activation * 0.38) / 0.62, 0, 1);
    if (mesh.ref.current) {
      material.uniforms.uDraw.value = draw;
      material.uniforms.uOpacity.value = 0.5 * (1 - dim * 0.48);
      material.uniforms.uIntensity.value = 0.72 - dim * 0.22;
    }
    if (endRef.current) {
      endRef.current.scale.setScalar(0.035 * draw);
      const material = endRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = 0.58 * draw;
      material.emissiveIntensity = 0.8 * draw;
    }
  });

  return (
    <>
      <mesh ref={mesh.ref} geometry={geometry} scale={1}>
        <primitive attach="material" object={material} />
      </mesh>
      <mesh ref={endRef} position={end} scale={0.001}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color="#e9fdff"
          emissive="#8af0ff"
          emissiveIntensity={0}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
