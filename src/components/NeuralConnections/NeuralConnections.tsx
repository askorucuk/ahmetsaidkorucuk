import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { type DeviceQuality } from '../../hooks/useDeviceQuality';
import { type SceneState } from '../ScrollExperience/sceneState';

type NeuralConnectionsProps = {
  sceneState: React.MutableRefObject<SceneState>;
  quality: DeviceQuality;
  reducedMotion: boolean;
};

export function NeuralConnections({ sceneState, quality, reducedMotion }: NeuralConnectionsProps) {
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const state = sceneState.current;
    const network = reducedMotion ? 1 : state.networkForm;
    const pulse = reducedMotion ? 1 : 1 + Math.sin(clock.elapsedTime * 0.8) * 0.06;

    if (core.current) {
      core.current.scale.setScalar((0.035 + network * 0.16 + state.finale * 0.08) * pulse);
      const material = core.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = (0.55 + network * 1.6 + state.finale * 0.8) * quality.bloomLikeIntensity;
      material.opacity = 0.04 + network * 0.08;
    }

    if (halo.current) {
      halo.current.scale.setScalar((0.32 + network * 0.7 + state.finale * 0.16) * pulse);
      const material = halo.current.material as THREE.MeshBasicMaterial;
      material.opacity = (0.015 + network * 0.035) * (1 - state.dimNetwork * 0.6);
    }
  });

  return (
    <>
      <mesh ref={core}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color="#9ff7ff"
          emissive="#4de8ff"
          emissiveIntensity={1}
          transparent
          opacity={0.14}
          roughness={0.25}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={halo}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color="#4de8ff" transparent opacity={0.05} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  );
}
