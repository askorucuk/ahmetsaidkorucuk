import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { type SceneState } from '../ScrollExperience/sceneState';
import { type Project } from '../../data/content';
import { type DeviceQuality } from '../../hooks/useDeviceQuality';
import { type NeuronModel } from '../../data/neuralField';
import { AxonPath } from './AxonPath';
import { AxonTerminal } from './AxonTerminal';
import { DendriteBranch } from './DendriteBranch';
import { NeuronFactory } from './NeuronFactory';
import { getNeuronTransform } from './NeuralNetworkManager';
import { NeuronSoma } from './NeuronSoma';
import { SignalParticle } from './SignalParticle';
import { SynapseConnection } from './SynapseConnection';

type NeuronSystemProps = {
  sceneState: React.MutableRefObject<SceneState>;
  quality: DeviceQuality;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
  projects: readonly Project[];
};

export function NeuronSystem({ sceneState, quality, pointer, reducedMotion, projects }: NeuronSystemProps) {
  const group = useRef<THREE.Group>(null);
  const network = useMemo(
    () => NeuronFactory.createNetwork(quality.neuronCount, quality.connectionCount),
    [quality.connectionCount, quality.neuronCount]
  );

  useFrame(({ camera }) => {
    const state = sceneState.current;
    const px = reducedMotion ? 0 : pointer.current.x * 0.38;
    const py = reducedMotion ? 0 : pointer.current.y * 0.22;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, state.cameraX + px, 0.045);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, state.cameraY - py, 0.045);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, state.cameraZ, 0.045);
    camera.lookAt(state.focusX, state.focusY, state.focusZ);

    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.current.x * 0.026, 0.035);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.current.y * 0.016, 0.035);
    }
  });

  return (
    <group ref={group} scale={quality.isMobile ? 0.72 : 1}>
      {network.neurons.map((neuron) => (
        <AnatomicalNeuron
          key={neuron.id}
          neuron={neuron}
          sceneState={sceneState}
          quality={quality}
          reducedMotion={reducedMotion}
          projects={projects}
        />
      ))}
      {network.synapses.map((synapse) => (
        <group key={synapse.id}>
          <SynapseConnection
            synapse={synapse}
            sceneState={sceneState}
            reducedMotion={reducedMotion}
            dim={sceneState.current.dimNetwork}
          />
          <SignalParticle
            synapse={synapse}
            sceneState={sceneState}
            reducedMotion={reducedMotion}
          />
        </group>
      ))}
    </group>
  );
}

type AnatomicalNeuronProps = {
  neuron: NeuronModel;
  sceneState: React.MutableRefObject<SceneState>;
  quality: DeviceQuality;
  reducedMotion: boolean;
  projects: readonly Project[];
};

function AnatomicalNeuron({ neuron, sceneState, quality, reducedMotion, projects }: AnatomicalNeuronProps) {
  const root = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const label = neuron.projectIndex >= 0 ? projects[neuron.projectIndex]?.name : undefined;

  useFrame(({ clock }) => {
    if (!root.current) return;

    const state = sceneState.current;
    const transform = getNeuronTransform(neuron, state, clock.elapsedTime, reducedMotion);
    const active = state.activeProject === neuron.projectIndex ? state.projectFocus : 0;

    root.current.position.copy(transform.position);
    root.current.rotation.copy(neuron.rotation);
    root.current.scale.setScalar(transform.scale * (1 + active * 0.25) * (hovered ? 1.08 : 1));
  });

  const state = sceneState.current;
  const active = state.activeProject === neuron.projectIndex ? state.projectFocus : 0;
  const dim =
    neuron.projectIndex >= 0 && state.activeProject === neuron.projectIndex
      ? 0
      : Math.max(state.dimNetwork, state.projectFocus * 0.46);

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    if (neuron.projectIndex < 0) return;
    event.stopPropagation();
    document.getElementById(`project-${projects[neuron.projectIndex]?.id}`)?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'center'
    });
  };

  return (
    <group
      ref={root}
      onPointerOver={(event) => {
        if (neuron.projectIndex < 0) return;
        event.stopPropagation();
        setHovered(true);
        document.body.classList.add('hasPointerTarget');
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.classList.remove('hasPointerTarget');
      }}
      onClick={onClick}
    >
      <NeuronSoma neuron={neuron} active={active} sceneState={sceneState} reducedMotion={reducedMotion} dim={dim} />
      {neuron.dendrites.map((branch) => (
        <DendriteBranch
          key={branch.id}
          branch={branch}
          schedule={neuron.schedule}
          palette={neuron.palette}
          sceneState={sceneState}
          reducedMotion={reducedMotion}
          dim={dim}
        />
      ))}
      <AxonPath
        axon={neuron.axon}
        schedule={neuron.schedule}
        palette={neuron.palette}
        sceneState={sceneState}
        reducedMotion={reducedMotion}
        dim={dim}
      />
      {neuron.axon.terminals.map((terminal) => (
        <AxonTerminal
          key={terminal.id}
          terminal={terminal}
          schedule={neuron.schedule}
          palette={neuron.palette}
          sceneState={sceneState}
          reducedMotion={reducedMotion}
          dim={dim}
        />
      ))}
      {neuron.projectIndex >= 0 && (
        <mesh scale={0.58 + active * 0.22}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      {label && (
        <mesh position={[0, -0.42 * neuron.scale, 0]} scale={0.025 + active * 0.018}>
          <ringGeometry args={[7.5, 8.2, 36]} />
          <meshBasicMaterial
            color={hovered || active > 0 ? '#b9fbff' : '#4de8ff'}
            transparent
            opacity={(0.12 + active * 0.34 + (hovered ? 0.18 : 0)) * quality.bloomLikeIntensity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}
