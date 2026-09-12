import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { type NeuronModel } from '../../data/neuralField';
import { type SceneState } from '../ScrollExperience/sceneState';
import { createOrganicSomaGeometry } from './geometry';
import { getActivationProgress } from './NeuralNetworkManager';

type NeuronSomaProps = {
  neuron: NeuronModel;
  active: number;
  sceneState: React.MutableRefObject<SceneState>;
  reducedMotion: boolean;
  dim: number;
};

export function NeuronSoma({ neuron, active, sceneState, reducedMotion, dim }: NeuronSomaProps) {
  const soma = useMemo(() => ({ ref: { current: null as THREE.Mesh | null } }), []);
  const core = useMemo(() => ({ ref: { current: null as THREE.Mesh | null } }), []);
  const halo = useMemo(() => ({ ref: { current: null as THREE.Mesh | null } }), []);
  const geometry = useMemo(() => createOrganicSomaGeometry(neuron.seed), [neuron.seed]);
  const palette = useMemo(
    () =>
      [
        { color: '#5cc7e0', glow: '#163b58', core: '#70e7ff' },
        { color: '#6798ff', glow: '#1b2f6c', core: '#a9c4ff' },
        { color: '#6ee0c8', glow: '#173f3b', core: '#b7fff0' },
        { color: '#8f7cff', glow: '#2d235f', core: '#d9d0ff' }
      ][neuron.palette],
    [neuron.palette]
  );

  useFrame(({ clock }) => {
    const activation = getActivationProgress(neuron.schedule, sceneState.current.growthFront, reducedMotion);
    const breath = reducedMotion ? 1 : 1 + Math.sin(clock.elapsedTime * 0.65 + neuron.seed * 14) * 0.014 * activation.somaBody;
    const base = 0.28 * neuron.scale * breath * (1 + active * 0.22);

    if (soma.ref.current) {
      soma.ref.current.scale.copy(neuron.somaScale).multiplyScalar(base * activation.somaBody);
      const material = soma.ref.current.material as THREE.MeshPhysicalMaterial;
      material.emissiveIntensity = (0.32 + active * 1.35 + activation.connected * 0.36) * (1 - dim * 0.6) * activation.somaBody;
      material.opacity = (0.42 + active * 0.14) * (1 - dim * 0.5) * activation.somaBody;
    }

    if (core.ref.current) {
      core.ref.current.scale.setScalar(base * 0.24 * activation.somaCore);
      const material = core.ref.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = (0.65 + active * 1.7 + activation.receive * 0.45) * (1 - dim * 0.45) * activation.somaCore;
      material.opacity = (0.5 + active * 0.22) * (1 - dim * 0.5) * activation.somaCore;
    }

    if (halo.ref.current) {
      const receiveWave = Math.max(activation.receive - activation.somaBody * 0.45, 0);
      const connectedWave = Math.max(activation.connected - sceneState.current.finale * 0.2, 0);
      const wave = Math.max(receiveWave, connectedWave * 0.6);
      halo.ref.current.scale.setScalar(base * (0.9 + wave * 1.25));
      const material = halo.ref.current.material as THREE.MeshBasicMaterial;
      material.opacity = wave * 0.045 * (1 - dim * 0.6);
    }
  });

  return (
    <>
      <mesh ref={soma.ref} geometry={geometry} scale={0.001}>
        <meshPhysicalMaterial
          color={palette.color}
          emissive={palette.glow}
          emissiveIntensity={0}
          transparent
          opacity={0}
          roughness={0.46}
          metalness={0.02}
          transmission={0.18}
          thickness={0.5}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={core.ref} scale={0.001}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial
          color="#e9fdff"
          emissive={palette.core}
          emissiveIntensity={0}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={halo.ref} scale={0.001}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshBasicMaterial color={palette.core} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  );
}
