import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { type ActivationSchedule, type BranchPath } from '../../data/neuralField';
import { type SceneState } from '../ScrollExperience/sceneState';
import { createGrowthMaterial, createTaperedTubeGeometry } from './geometry';
import { linearProgressInRange } from './NeuralNetworkManager';

type DendriteBranchProps = {
  branch: BranchPath;
  schedule: ActivationSchedule;
  palette: number;
  sceneState: React.MutableRefObject<SceneState>;
  reducedMotion: boolean;
  dim: number;
};

export function DendriteBranch({ branch, schedule, palette, sceneState, reducedMotion, dim }: DendriteBranchProps) {
  const mesh = useMemo(() => ({ ref: { current: null as THREE.Mesh | null } }), []);
  const geometry = useMemo(
    () => createTaperedTubeGeometry(branch.points, branch.radiusStart, branch.radiusEnd, 18, 6),
    [branch]
  );
  const material = useMemo(
    () =>
      createGrowthMaterial(
        [
          branch.level === 0 ? '#6ceaff' : '#88b7ff',
          branch.level === 0 ? '#7da7ff' : '#6c7cff',
          branch.level === 0 ? '#76efd5' : '#82cfff',
          branch.level === 0 ? '#b197ff' : '#738dff'
        ][palette],
        ['#2ccfff', '#4768ff', '#36d4ba', '#8e6cff'][palette],
        0,
        0
      ),
    [branch.level, palette]
  );

  useFrame(({ clock }) => {
    if (!mesh.ref.current) return;
    const neuronProgress = reducedMotion ? 1 : linearProgressInRange(sceneState.current.growthFront, schedule.dendriteStart, schedule.dendriteEnd);
    const draw = THREE.MathUtils.clamp((neuronProgress - branch.activation * 0.62) / 0.42, 0, 1);
    const tremor = reducedMotion ? 1 : 1 + Math.sin(clock.elapsedTime * 1.3 + branch.activation * 9) * 0.008;
    mesh.ref.current.scale.setScalar(tremor);
    material.uniforms.uDraw.value = draw;
    material.uniforms.uOpacity.value = (0.46 - branch.level * 0.08) * (1 - dim * 0.55);
    material.uniforms.uIntensity.value = 0.7 - dim * 0.25;
  });

  return (
    <mesh ref={mesh.ref} geometry={geometry} scale={1}>
      <primitive attach="material" object={material} />
    </mesh>
  );
}
