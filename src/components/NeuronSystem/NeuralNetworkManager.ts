import * as THREE from 'three';
import { type ActivationSchedule, type NeuralNetworkModel, type NeuronModel } from '../../data/neuralField';
import { type SceneState } from '../ScrollExperience/sceneState';

export function progressInRange(value: number, start: number, end: number) {
  if (end <= start) return value >= end ? 1 : 0;
  return THREE.MathUtils.smoothstep(value, start, end);
}

export function linearProgressInRange(value: number, start: number, end: number) {
  if (end <= start) return value >= end ? 1 : 0;
  return THREE.MathUtils.clamp((value - start) / (end - start), 0, 1);
}

export function getActivationProgress(schedule: ActivationSchedule, growth: number, reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      receive: 1,
      somaCore: 1,
      somaBody: 1,
      dendrites: 1,
      axon: 1,
      connected: 1
    };
  }

  return {
    receive: progressInRange(growth, schedule.receiveStart, schedule.somaCoreStart + 0.025),
    somaCore: progressInRange(growth, schedule.somaCoreStart, schedule.somaBodyStart + 0.018),
    somaBody: progressInRange(growth, schedule.somaBodyStart, schedule.somaEnd),
    dendrites: linearProgressInRange(growth, schedule.dendriteStart, schedule.dendriteEnd),
    axon: linearProgressInRange(growth, schedule.axonStart, schedule.axonEnd),
    connected: progressInRange(growth, schedule.connectedAt - 0.02, schedule.connectedAt + 0.025)
  };
}

export function getNeuronTransform(neuron: NeuronModel, state: SceneState, time: number, reducedMotion: boolean) {
  const activation = getActivationProgress(neuron.schedule, state.growthFront, reducedMotion);
  const birth = Math.max(activation.somaCore * 0.35, activation.somaBody);
  const network = reducedMotion ? 1 : Math.max(state.networkForm, activation.receive * 0.4);
  const position = neuron.cell.clone().lerp(neuron.network, network);
  const drift = reducedMotion ? 0 : Math.sin(time * (0.18 + neuron.seed * 0.12) + neuron.seed * 12) * 0.018;
  position.y += drift * (1 - network * 0.45);

  return {
    position,
    scale: (0.12 + birth * 0.88) * (0.9 + activation.connected * 0.1),
    activation
  };
}

export function getProjectNeuron(network: NeuralNetworkModel, projectIndex: number) {
  return network.neurons.find((neuron) => neuron.projectIndex === projectIndex);
}
