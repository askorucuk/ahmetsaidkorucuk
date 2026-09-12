import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { type SynapseModel } from '../../data/neuralField';
import { type SceneState } from '../ScrollExperience/sceneState';
import { createGrowthMaterial, createTaperedTubeGeometry } from './geometry';
import { linearProgressInRange } from './NeuralNetworkManager';

type SynapseConnectionProps = {
  synapse: SynapseModel;
  sceneState: React.MutableRefObject<SceneState>;
  reducedMotion: boolean;
  dim: number;
};

export function SynapseConnection({ synapse, sceneState, reducedMotion, dim }: SynapseConnectionProps) {
  const mesh = useMemo(() => ({ ref: { current: null as THREE.Mesh | null } }), []);
  const endRef = useMemo(() => ({ current: null as THREE.Mesh | null }), []);
  const geometry = useMemo(() => createTaperedTubeGeometry(synapse.points, 0.011, 0.004, 14, 5), [synapse]);
  const material = useMemo(() => createGrowthMaterial('#a9f7ff', '#4de8ff', 0, 0), []);
  const end = synapse.points[synapse.points.length - 1];

  useFrame(() => {
    const draw = reducedMotion ? 1 : linearProgressInRange(sceneState.current.growthFront, synapse.start, synapse.end);
    if (mesh.ref.current) {
      material.uniforms.uDraw.value = draw;
      material.uniforms.uOpacity.value = 0.34 * (1 - dim * 0.6);
      material.uniforms.uIntensity.value = 0.62 * (1 - dim * 0.45);
    }
    if (endRef.current) {
      endRef.current.scale.setScalar(0.045 * draw);
      const material = endRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = 0.5 * draw;
      material.emissiveIntensity = 1.2 * draw;
    }
  });

  return (
    <>
      <mesh ref={mesh.ref} geometry={geometry} scale={1}>
        <primitive attach="material" object={material} />
      </mesh>
      <mesh ref={endRef} position={end} scale={0.001}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial
          color="#f4feff"
          emissive="#8df1ff"
          emissiveIntensity={0}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
