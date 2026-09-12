import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { type DeviceQuality } from '../../hooks/useDeviceQuality';
import { type SceneState } from '../ScrollExperience/sceneState';

type NeuralSignalFieldProps = {
  sceneState: React.MutableRefObject<SceneState>;
  quality: DeviceQuality;
  reducedMotion: boolean;
};

type SignalFieldData = {
  geometry: THREE.BufferGeometry;
  material: THREE.ShaderMaterial;
};

const vertexShader = `
  attribute vec3 aOrigin;
  attribute vec3 aTarget;
  attribute float aSeed;
  attribute float aSize;
  attribute float aRoute;
  attribute float aCluster;

  uniform float uGrowth;
  uniform float uTime;
  uniform float uIntro;
  uniform float uPixelRatio;
  uniform float uReducedMotion;

  varying float vAlpha;
  varying float vPulse;
  varying float vCluster;

  float easeInOut(float t) {
    t = clamp(t, 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
  }

  void main() {
    float front = smoothstep(aRoute - 0.08, aRoute + 0.08, uGrowth);
    float settle = easeInOut(front);
    float introBlink = 0.28 + 0.72 * pow(0.5 + 0.5 * sin(uTime * (1.0 + aSeed * 2.4) + aSeed * 18.849), 4.0);
    float reaction = smoothstep(aRoute - 0.025, aRoute + 0.06, uGrowth) * (1.0 - smoothstep(aRoute + 0.08, aRoute + 0.2, uGrowth));
    float alive = max(introBlink * (1.0 - settle * 0.55), settle * (0.42 + 0.34 * aCluster));
    float orbit = uReducedMotion > 0.5 ? 0.0 : (1.0 - settle) * 0.025;

    vec3 wave = vec3(
      sin(uTime * 0.24 + aSeed * 17.0),
      cos(uTime * 0.2 + aSeed * 11.0),
      sin(uTime * 0.18 + aSeed * 7.0)
    ) * orbit;

    vec3 pos = mix(aOrigin + wave, aTarget, settle);
    pos += normalize(aTarget + vec3(0.13, 0.21, 0.09)) * reaction * 0.11;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float depthScale = clamp(11.0 / -mvPosition.z, 0.45, 2.2);
    gl_PointSize = aSize * uPixelRatio * depthScale * (1.0 + reaction * 1.9 + introBlink * 0.34);

    vPulse = introBlink + reaction * 1.8;
    vCluster = aCluster;
    vAlpha = (0.11 + alive * 0.42 + reaction * 0.4) * mix(0.55, 1.0, uIntro);
  }
`;

const fragmentShader = `
  uniform vec3 uCold;
  uniform vec3 uWarm;
  uniform vec3 uHot;
  uniform float uDim;
  varying float vAlpha;
  varying float vPulse;
  varying float vCluster;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;

    float core = smoothstep(0.5, 0.02, dist);
    float halo = smoothstep(0.5, 0.16, dist) * 0.36;
    vec3 base = mix(uCold, uWarm, smoothstep(0.2, 1.0, vCluster));
    vec3 color = mix(base, uHot, clamp(vPulse - 0.65, 0.0, 1.0) * 0.38);
    gl_FragColor = vec4(color, (core + halo) * vAlpha * (1.0 - uDim * 0.42));
  }
`;

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function routePoint(progress: number, lane: number, rnd: () => number) {
  const route = [
    new THREE.Vector3(-6.4, -2.3, -1.2),
    new THREE.Vector3(-4.2, -1.35, 0.35),
    new THREE.Vector3(-2.05, -0.55, -0.18),
    new THREE.Vector3(-0.55, 0.0, 0.25),
    new THREE.Vector3(0.95, 0.38, -0.25),
    new THREE.Vector3(2.85, 1.55, 0.18),
    new THREE.Vector3(4.45, 1.95, -0.5),
    new THREE.Vector3(4.55, -1.55, 0.34),
    new THREE.Vector3(1.75, -2.05, -0.22)
  ];
  const curve = new THREE.CatmullRomCurve3(route, false, 'catmullrom', 0.42);
  const point = curve.getPoint(THREE.MathUtils.clamp(progress, 0, 1));
  const laneOffset = [-2.2, -1.35, -0.6, 0, 0.66, 1.42, 2.15][lane % 7];
  const spread = 0.5 + Math.sin(progress * Math.PI) * 0.9;

  point.x += Math.sin(progress * Math.PI * 8 + lane) * 0.38 + (rnd() - 0.5) * spread;
  point.y += laneOffset * 0.4 + Math.cos(progress * Math.PI * 5 + lane) * 0.24 + (rnd() - 0.5) * spread * 0.82;
  point.z += laneOffset * 0.48 + (rnd() - 0.5) * (1.25 + spread);

  return point;
}

function createSignalField(count: number, reducedMotion: boolean): SignalFieldData {
  const rnd = seededRandom(reducedMotion ? 9199 : 74821 + count);
  const origins = new Float32Array(count * 3);
  const targets = new Float32Array(count * 3);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  const routes = new Float32Array(count);
  const clusters = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const seed = rnd();
    const lane = Math.floor(rnd() * 7);
    const route = THREE.MathUtils.clamp(Math.pow(i / Math.max(1, count - 1), 0.84) + (rnd() - 0.5) * 0.045, 0, 1);
    const target = routePoint(route, lane, rnd);
    const radial = 4.8 + rnd() * 6.7;
    const angle = rnd() * Math.PI * 2;
    const origin = new THREE.Vector3(
      Math.cos(angle) * radial + (rnd() - 0.5) * 1.4,
      (rnd() - 0.5) * 5.8,
      -4.4 + rnd() * 6.6
    );

    if (i % 9 === 0) {
      origin.lerp(target, 0.34 + rnd() * 0.2);
    }

    const index = i * 3;
    positions[index] = origin.x;
    positions[index + 1] = origin.y;
    positions[index + 2] = origin.z;
    origins[index] = origin.x;
    origins[index + 1] = origin.y;
    origins[index + 2] = origin.z;
    targets[index] = target.x;
    targets[index + 1] = target.y;
    targets[index + 2] = target.z;
    seeds[i] = seed;
    sizes[i] = 5.8 + rnd() * 11.5 + (i % 31 === 0 ? 6.5 : 0);
    routes[i] = route;
    clusters[i] = lane / 6;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aOrigin', new THREE.BufferAttribute(origins, 3));
  geometry.setAttribute('aTarget', new THREE.BufferAttribute(targets, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aRoute', new THREE.BufferAttribute(routes, 1));
  geometry.setAttribute('aCluster', new THREE.BufferAttribute(clusters, 1));
  geometry.computeBoundingSphere();

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uGrowth: { value: reducedMotion ? 1 : 0 },
      uTime: { value: 0 },
      uIntro: { value: 1 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) },
      uReducedMotion: { value: reducedMotion ? 1 : 0 },
      uDim: { value: 0 },
      uCold: { value: new THREE.Color('#145477') },
      uWarm: { value: new THREE.Color('#42e8ff') },
      uHot: { value: new THREE.Color('#b99cff') }
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending
  });

  return { geometry, material };
}

export function NeuralSignalField({ sceneState, quality, reducedMotion }: NeuralSignalFieldProps) {
  const points = useRef<THREE.Points>(null);
  const { geometry, material } = useMemo(
    () => createSignalField(quality.particleCount, reducedMotion),
    [quality.particleCount, reducedMotion]
  );

  useFrame(({ clock }) => {
    const state = sceneState.current;
    material.uniforms.uGrowth.value = reducedMotion ? 1 : state.growthFront;
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uIntro.value = THREE.MathUtils.lerp(0.88, 1.0, state.intro);
    material.uniforms.uPixelRatio.value = quality.dpr;
    material.uniforms.uDim.value = Math.max(0, state.dimNetwork - 0.05);

    if (points.current) {
      points.current.rotation.y = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.05) * 0.012;
    }
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}
