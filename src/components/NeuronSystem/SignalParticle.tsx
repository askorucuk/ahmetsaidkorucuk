import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { type SynapseModel } from '../../data/neuralField';
import { type SceneState } from '../ScrollExperience/sceneState';

type SignalParticleProps = {
  synapse: SynapseModel;
  sceneState: React.MutableRefObject<SceneState>;
  reducedMotion: boolean;
};

export function SignalParticle({ synapse, sceneState, reducedMotion }: SignalParticleProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(synapse.points), [synapse]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const growth = sceneState.current.growthFront;
    const formation = reducedMotion ? 1 : THREE.MathUtils.clamp((growth - synapse.start) / (synapse.end - synapse.start), 0, 1);
    const finalFlow = sceneState.current.finale > 0.25 ? (clock.elapsedTime * (0.12 + synapse.seed * 0.08) + synapse.seed) % 1 : formation;
    const phase = reducedMotion ? 0.85 : finalFlow;
    mesh.current.position.copy(curve.getPoint(phase));
    mesh.current.scale.setScalar(0.035 * formation * (reducedMotion ? 0.45 : 1));
    const material = mesh.current.material as THREE.MeshStandardMaterial;
    material.opacity = formation * (reducedMotion ? 0.25 : 0.8);
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#c8fbff"
        emissiveIntensity={1.8}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  );
}
