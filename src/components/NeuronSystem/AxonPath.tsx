import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { type ActivationSchedule, type AxonPathModel } from '../../data/neuralField';
import { type SceneState } from '../ScrollExperience/sceneState';
import { createGrowthMaterial, createTaperedTubeGeometry } from './geometry';
import { linearProgressInRange } from './NeuralNetworkManager';

type AxonPathProps = {
  axon: AxonPathModel;
  schedule: ActivationSchedule;
  palette: number;
  sceneState: React.MutableRefObject<SceneState>;
  reducedMotion: boolean;
  dim: number;
};

export function AxonPath({ axon, schedule, palette, sceneState, reducedMotion, dim }: AxonPathProps) {
  const mesh = useMemo(() => ({ ref: { current: null as THREE.Mesh | null } }), []);
  const myelinRefs = useMemo(() => axon.myelin.map(() => ({ current: null as THREE.Mesh | null })), [axon]);
  const geometry = useMemo(() => createTaperedTubeGeometry(axon.points, 0.052, 0.018, 24, 7), [axon]);
  const material = useMemo(
    () =>
      createGrowthMaterial(
        ['#9fefff', '#a8bdff', '#9dffe9', '#ccbfff'][palette],
        ['#42dcff', '#5c78ff', '#50dfc8', '#9b7cff'][palette],
        0,
        0
      ),
    [palette]
  );

  useFrame(() => {
    const progress = reducedMotion ? 1 : linearProgressInRange(sceneState.current.growthFront, schedule.axonStart, schedule.axonEnd);
    const draw = THREE.MathUtils.clamp((progress - axon.activation * 0.45) / 0.72, 0, 1);
    if (mesh.ref.current) {
      material.uniforms.uDraw.value = draw;
      material.uniforms.uOpacity.value = 0.64 * (1 - dim * 0.5);
      material.uniforms.uIntensity.value = 0.92 - dim * 0.28;
    }
    myelinRefs.forEach((ref, index) => {
      if (!ref.current) return;
      const segmentDraw = THREE.MathUtils.clamp((draw - axon.myelin[index].activation * 0.38) / 0.55, 0, 1);
      ref.current.scale.copy(axon.myelin[index].scale).multiplyScalar(segmentDraw);
      const material = ref.current.material as THREE.MeshStandardMaterial;
      material.opacity = 0.42 * segmentDraw;
      material.emissiveIntensity = 0.45 * segmentDraw;
    });
  });

  return (
    <>
      <mesh ref={mesh.ref} geometry={geometry} scale={1}>
        <primitive attach="material" object={material} />
      </mesh>
      {axon.myelin.map((segment, index) => (
        <mesh
          key={`${segment.activation}-${index}`}
          ref={myelinRefs[index]}
          position={segment.position}
          rotation={segment.rotation}
          scale={0.001}
        >
          <capsuleGeometry args={[1, 1.3, 4, 8]} />
          <meshStandardMaterial
            color="#d7fbff"
            emissive="#77e8ff"
            emissiveIntensity={0}
            transparent
            opacity={0}
            roughness={0.18}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}
