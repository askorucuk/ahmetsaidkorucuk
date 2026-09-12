import * as THREE from 'three';

export type NeuronType = 'multipolar' | 'bipolar' | 'pseudounipolar';

export type BranchPath = {
  id: string;
  points: THREE.Vector3[];
  radiusStart: number;
  radiusEnd: number;
  activation: number;
  level: number;
};

export type AxonPathModel = {
  points: THREE.Vector3[];
  terminals: BranchPath[];
  myelin: { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3; activation: number }[];
  activation: number;
};

export type ActivationSchedule = {
  order: number;
  receiveStart: number;
  somaCoreStart: number;
  somaBodyStart: number;
  somaEnd: number;
  dendriteStart: number;
  dendriteEnd: number;
  axonStart: number;
  axonEnd: number;
  connectedAt: number;
};

export type NeuronModel = {
  id: number;
  type: NeuronType;
  cell: THREE.Vector3;
  network: THREE.Vector3;
  scale: number;
  seed: number;
  projectIndex: number;
  rotation: THREE.Euler;
  somaScale: THREE.Vector3;
  palette: number;
  dendrites: BranchPath[];
  dendriteTargets: THREE.Vector3[];
  axon: AxonPathModel;
  schedule: ActivationSchedule;
};

export type SynapseModel = {
  id: string;
  fromNeuron: number;
  toNeuron: number;
  points: THREE.Vector3[];
  start: number;
  end: number;
  seed: number;
};

export type NeuralNetworkModel = {
  neurons: NeuronModel[];
  synapses: SynapseModel[];
};

function random(seed: number) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(value: number) {
  return THREE.MathUtils.clamp(value, 0, 1);
}

function routePoint(progress: number, rnd: () => number) {
  const route = [
    new THREE.Vector3(-5.2, -1.65, 0.3),
    new THREE.Vector3(-3.15, -0.9, -0.45),
    new THREE.Vector3(-1.25, -0.18, 0.2),
    new THREE.Vector3(0.35, 0.02, -0.15),
    new THREE.Vector3(1.65, 0.92, 0.25),
    new THREE.Vector3(3.55, 1.3, -0.35),
    new THREE.Vector3(3.95, -1.3, 0.3),
    new THREE.Vector3(1.45, -1.65, -0.25)
  ];
  const curve = new THREE.CatmullRomCurve3(route, false, 'catmullrom', 0.35);
  const point = curve.getPoint(clamp01(progress));
  const lane = Math.floor(progress * 18) % 5;
  const laneOffset = [-1.55, -0.75, 0, 0.72, 1.42][lane];
  point.x += (rnd() - 0.5) * 1.15 + Math.sin(progress * Math.PI * 5) * 0.42;
  point.y += (rnd() - 0.5) * 1.08 + Math.cos(progress * Math.PI * 7) * 0.34 + laneOffset * 0.36;
  point.z += (rnd() - 0.5) * 1.75 + laneOffset * 0.55;
  return point;
}

function directionFromAngles(theta: number, phi: number) {
  return new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta)
  ).normalize();
}

function makeCurvePoints(origin: THREE.Vector3, direction: THREE.Vector3, length: number, curl: number, rnd: () => number) {
  const side = new THREE.Vector3(-direction.z, rnd() - 0.5, direction.x).normalize();
  const lift = new THREE.Vector3().crossVectors(direction, side).normalize();

  return [0, 0.28, 0.58, 1].map((step) => {
    const wave = Math.sin(step * Math.PI) * curl;
    return origin
      .clone()
      .add(direction.clone().multiplyScalar(length * step))
      .add(side.clone().multiplyScalar((rnd() - 0.5) * curl * 0.48 + wave * (rnd() - 0.5)))
      .add(lift.clone().multiplyScalar(Math.sin(step * Math.PI * 1.25) * curl * 0.34));
  });
}

function branchFrom(
  id: string,
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  length: number,
  radiusStart: number,
  radiusEnd: number,
  activation: number,
  level: number,
  rnd: () => number
): BranchPath {
  return {
    id,
    points: makeCurvePoints(origin, direction, length, 0.18 / (level + 1), rnd),
    radiusStart,
    radiusEnd,
    activation,
    level
  };
}

function createDendriteTree(neuronId: number, rootCount: number, radius: number, rnd: () => number, mode: NeuronType) {
  const branches: BranchPath[] = [];
  const targets: THREE.Vector3[] = [];

  for (let i = 0; i < rootCount; i += 1) {
    const theta = (i / rootCount) * Math.PI * 2 + rnd() * 0.65;
    const phi = mode === 'bipolar' ? Math.PI * 0.5 : 0.75 + rnd() * 1.25;
    const direction =
      mode === 'bipolar'
        ? new THREE.Vector3(i % 2 === 0 ? -1 : 1, (rnd() - 0.5) * 0.26, (rnd() - 0.5) * 0.22).normalize()
        : directionFromAngles(theta, phi);
    const start = direction.clone().multiplyScalar(radius * 0.76);
    const main = branchFrom(
      `${neuronId}-d${i}`,
      start,
      direction,
      radius * (mode === 'bipolar' ? 2.0 : 1.45 + rnd() * 0.55),
      0.038,
      0.012,
      0.05 + i / rootCount * 0.28,
      0,
      rnd
    );
    branches.push(main);

    const branchCount = mode === 'bipolar' ? 2 : 2 + Math.floor(rnd() * 3);
    const anchor = main.points[2];
    for (let j = 0; j < branchCount; j += 1) {
      const secondaryDirection = direction
        .clone()
        .add(directionFromAngles(theta + (j - 1) * 0.7 + rnd() * 0.42, phi + (rnd() - 0.5) * 0.52).multiplyScalar(0.65))
        .normalize();
      const secondary = branchFrom(
        `${neuronId}-d${i}-${j}`,
        anchor,
        secondaryDirection,
        radius * (0.62 + rnd() * 0.42),
        0.018,
        0.005,
        0.44 + i / rootCount * 0.16 + j * 0.035,
        1,
        rnd
      );
      branches.push(secondary);
      targets.push(secondary.points[secondary.points.length - 1]);

      if (rnd() > 0.55 && mode !== 'bipolar') {
        const tertiaryDirection = secondaryDirection
          .clone()
          .add(directionFromAngles(theta + rnd() * 1.2, phi + rnd() * 0.75).multiplyScalar(0.42))
          .normalize();
        const tertiary = branchFrom(
          `${neuronId}-d${i}-${j}-t`,
          secondary.points[2],
          tertiaryDirection,
          radius * (0.34 + rnd() * 0.22),
          0.01,
          0.0025,
          0.68 + j * 0.03,
          2,
          rnd
        );
        branches.push(tertiary);
        targets.push(tertiary.points[tertiary.points.length - 1]);
      }
    }
  }

  return { branches, targets };
}

function createAxon(neuronId: number, radius: number, rnd: () => number, type: NeuronType): AxonPathModel {
  const theta = rnd() * Math.PI * 2;
  const direction =
    type === 'bipolar'
      ? new THREE.Vector3(1, (rnd() - 0.5) * 0.18, (rnd() - 0.5) * 0.12).normalize()
      : directionFromAngles(theta, 1.05 + rnd() * 0.75);
  const start = direction.clone().multiplyScalar(radius * 0.74);
  const length = radius * (type === 'pseudounipolar' ? 4.0 : 3.2 + rnd() * 1.1);
  const points = makeCurvePoints(start, direction, length, 0.2, rnd);
  const terminalOrigin = points[points.length - 1];
  const terminalCount = 3 + Math.floor(rnd() * 4);
  const terminals: BranchPath[] = [];

  for (let i = 0; i < terminalCount; i += 1) {
    const terminalDirection = direction
      .clone()
      .add(directionFromAngles(theta + (i / terminalCount) * Math.PI * 2, 1.2 + rnd() * 0.55).multiplyScalar(0.65))
      .normalize();
    terminals.push(
      branchFrom(
        `${neuronId}-a-terminal-${i}`,
        terminalOrigin,
        terminalDirection,
        radius * (0.62 + rnd() * 0.34),
        0.013,
        0.0035,
        0.62 + i * 0.045,
        1,
        rnd
      )
    );
  }

  const curve = new THREE.CatmullRomCurve3(points);
  const myelin = [0.22, 0.39, 0.56, 0.73].map((step, index) => {
    const position = curve.getPoint(step);
    const tangent = curve.getTangent(step).normalize();
    const rotation = new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent)
    );

    return {
      position,
      rotation,
      scale: new THREE.Vector3(0.065, radius * 0.24, 0.065),
      activation: 0.28 + index * 0.12
    };
  });

  return {
    points,
    terminals,
    myelin,
    activation: 0.12
  };
}

function createSchedule(order: number, total: number): ActivationSchedule {
  const normalized = total <= 1 ? 0 : order / (total - 1);
  const start = 0.015 + normalized * 0.74;
  const somaCoreStart = start;
  const somaBodyStart = start + 0.016;
  const somaEnd = start + 0.052;
  const dendriteStart = somaEnd;
  const dendriteEnd = dendriteStart + 0.09;
  const axonStart = dendriteEnd - 0.012;
  const axonEnd = axonStart + 0.095;

  return {
    order,
    receiveStart: Math.max(0, start - 0.018),
    somaCoreStart,
    somaBodyStart,
    somaEnd,
    dendriteStart,
    dendriteEnd,
    axonStart,
    axonEnd,
    connectedAt: axonEnd + 0.028
  };
}

export function createNeuralNodes(count: number): NeuronModel[] {
  const rnd = random(count < 14 ? 6203 : 4109);
  const projectSlots = [
    Math.floor(count * 0.18),
    Math.floor(count * 0.36),
    Math.floor(count * 0.54),
    Math.floor(count * 0.72),
    Math.floor(count * 0.88)
  ];

  return Array.from({ length: count }, (_, id) => {
    const routeProgress = count <= 1 ? 0 : id / (count - 1);
    const network = routePoint(routeProgress, rnd);
    const cell = network.clone().add(new THREE.Vector3((rnd() - 0.5) * 1.1, (rnd() - 0.5) * 0.8, (rnd() - 0.5) * 1.1));
    const projectIndex = projectSlots.findIndex((nodeId) => nodeId === id);
    const type: NeuronType = id % 5 === 0 ? 'bipolar' : id % 5 === 2 ? 'pseudounipolar' : 'multipolar';
    const scale = projectIndex >= 0 ? 0.98 : 0.56 + rnd() * 0.28;
    const somaRadius = 0.28 * scale;
    const dendriteCount = type === 'multipolar' ? 7 + Math.floor(rnd() * 4) : type === 'bipolar' ? 2 : 5;
    const dendrites = createDendriteTree(id, dendriteCount, somaRadius, rnd, type);

    return {
      id,
      type,
      cell,
      network,
      scale,
      seed: rnd(),
      projectIndex,
      rotation: new THREE.Euler((rnd() - 0.5) * 0.9, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.9),
      somaScale: new THREE.Vector3(1 + rnd() * 0.2, 0.72 + rnd() * 0.22, 0.86 + rnd() * 0.24),
      palette: id % 4,
      dendrites: dendrites.branches,
      dendriteTargets: dendrites.targets,
      axon: createAxon(id, somaRadius, rnd, type),
      schedule: createSchedule(id, count)
    };
  });
}

function worldFromLocal(neuron: NeuronModel, local: THREE.Vector3) {
  return local.clone().applyEuler(neuron.rotation).add(neuron.network);
}

function createSynapse(from: NeuronModel, to: NeuronModel, seed: number, index: number): SynapseModel {
  const rnd = random(seed + index * 97);
  const terminal = from.axon.terminals[index % from.axon.terminals.length];
  const fromWorld = worldFromLocal(from, terminal.points[terminal.points.length - 1]);
  const targetLocal =
    to.dendriteTargets.length > 0
      ? to.dendriteTargets[Math.floor(rnd() * Math.min(to.dendriteTargets.length, 8))]
      : new THREE.Vector3();
  const toWorld = worldFromLocal(to, targetLocal);
  const gap = toWorld.clone().sub(fromWorld).normalize();
  const toPoint = toWorld.clone().sub(gap.multiplyScalar(0.12));
  const middle = fromWorld
    .clone()
    .lerp(toPoint, 0.5)
    .add(new THREE.Vector3((rnd() - 0.5) * 0.22, (rnd() - 0.5) * 0.18, (rnd() - 0.5) * 0.22));

  return {
    id: `${from.id}-${to.id}-${index}`,
    fromNeuron: from.id,
    toNeuron: to.id,
    points: new THREE.CatmullRomCurve3([fromWorld, middle, toPoint], false, 'catmullrom', 0.4).getPoints(18),
    start: from.schedule.axonEnd - 0.018,
    end: Math.min(0.94, from.schedule.connectedAt),
    seed: rnd()
  };
}

export function createSynapses(neurons: NeuronModel[], count: number): SynapseModel[] {
  const synapses: SynapseModel[] = [];
  const used = new Set<string>();

  const add = (from: NeuronModel | undefined, to: NeuronModel | undefined, seed: number, index: number) => {
    if (!from || !to || from.id === to.id || synapses.length >= count) return;
    const key = `${from.id}:${to.id}`;
    if (used.has(key)) return;
    used.add(key);
    synapses.push(createSynapse(from, to, seed, index));
  };

  for (let i = 0; i < neurons.length - 1 && synapses.length < count; i += 1) {
    add(neurons[i], neurons[i + 1], 9182, i);
  }

  for (let i = 0; i < neurons.length - 2 && synapses.length < count; i += 2) {
    add(neurons[i], neurons[i + 2], 12219, i);
  }

  for (let i = 1; i < neurons.length - 3 && synapses.length < count; i += 3) {
    add(neurons[i], neurons[i + 3], 13277, i);
  }

  for (let i = 0; i < neurons.length - 4 && synapses.length < count; i += 1) {
    if (i % 3 !== 1) add(neurons[i], neurons[i + 4], 15199, i);
  }

  for (let i = 2; i < neurons.length - 6 && synapses.length < count; i += 4) {
    add(neurons[i], neurons[i + 6], 16381, i);
  }

  const branchPairs = [
    [Math.floor(neurons.length * 0.28), Math.floor(neurons.length * 0.55)],
    [Math.floor(neurons.length * 0.48), Math.floor(neurons.length * 0.78)],
    [Math.floor(neurons.length * 0.62), neurons.length - 1],
    [Math.floor(neurons.length * 0.18), Math.floor(neurons.length * 0.72)],
    [Math.floor(neurons.length * 0.36), Math.floor(neurons.length * 0.92)]
  ];

  branchPairs.forEach(([fromIndex, toIndex], index) => {
    if (synapses.length >= count) return;
    add(neurons[fromIndex], neurons[toIndex], 10491, index);
  });

  return synapses.slice(0, count);
}

export function createNeuralNetwork(count: number, connectionCount: number): NeuralNetworkModel {
  const neurons = createNeuralNodes(count);
  return {
    neurons,
    synapses: createSynapses(neurons, connectionCount)
  };
}
