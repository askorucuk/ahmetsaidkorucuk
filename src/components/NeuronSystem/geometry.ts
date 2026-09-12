import * as THREE from 'three';

export function createTaperedTubeGeometry(
  points: THREE.Vector3[],
  radiusStart: number,
  radiusEnd: number,
  tubularSegments = 18,
  radialSegments = 6
) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.45);
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const positions: number[] = [];
  const normals: number[] = [];
  const progressValues: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= tubularSegments; i += 1) {
    const progress = i / tubularSegments;
    const point = curve.getPoint(progress);
    const radius = THREE.MathUtils.lerp(radiusStart, radiusEnd, progress);
    const normal = frames.normals[i];
    const binormal = frames.binormals[i];

    for (let j = 0; j < radialSegments; j += 1) {
      const angle = (j / radialSegments) * Math.PI * 2;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      const vertexNormal = normal.clone().multiplyScalar(cos).add(binormal.clone().multiplyScalar(sin)).normalize();
      const vertex = point.clone().add(vertexNormal.clone().multiplyScalar(radius));

      positions.push(vertex.x, vertex.y, vertex.z);
      normals.push(vertexNormal.x, vertexNormal.y, vertexNormal.z);
      progressValues.push(progress);
    }
  }

  for (let i = 0; i < tubularSegments; i += 1) {
    for (let j = 0; j < radialSegments; j += 1) {
      const a = i * radialSegments + j;
      const b = i * radialSegments + ((j + 1) % radialSegments);
      const c = (i + 1) * radialSegments + ((j + 1) % radialSegments);
      const d = (i + 1) * radialSegments + j;

      indices.push(a, b, d, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('aPathProgress', new THREE.Float32BufferAttribute(progressValues, 1));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

export function createGrowthMaterial(color: string, glow: string, opacity: number, intensity: number) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uDraw: { value: 0 },
      uOpacity: { value: opacity },
      uIntensity: { value: intensity },
      uColor: { value: new THREE.Color(color) },
      uGlow: { value: new THREE.Color(glow) }
    },
    vertexShader: `
      attribute float aPathProgress;
      varying float vPathProgress;
      varying vec3 vNormal;

      void main() {
        vPathProgress = aPathProgress;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uDraw;
      uniform float uOpacity;
      uniform float uIntensity;
      uniform vec3 uColor;
      uniform vec3 uGlow;
      varying float vPathProgress;
      varying vec3 vNormal;

      void main() {
        if (vPathProgress > uDraw) discard;
        float tip = smoothstep(uDraw - 0.055, uDraw, vPathProgress);
        float light = 0.45 + max(dot(normalize(vNormal), normalize(vec3(0.2, 0.6, 0.8))), 0.0) * 0.35;
        vec3 color = mix(uColor * light, uGlow, tip * uIntensity);
        float alpha = uOpacity * smoothstep(0.0, 0.08, uDraw) * (0.72 + tip * 0.28);
        gl_FragColor = vec4(color, alpha);
      }
    `
  });
}

export function createOrganicSomaGeometry(seed: number) {
  const geometry = new THREE.IcosahedronGeometry(1, 3);
  const position = geometry.getAttribute('position') as THREE.BufferAttribute;
  const vector = new THREE.Vector3();

  for (let i = 0; i < position.count; i += 1) {
    vector.fromBufferAttribute(position, i);
    const wobble =
      1 +
      Math.sin(vector.x * 3.1 + seed * 7) * 0.055 +
      Math.cos(vector.y * 4.3 + seed * 11) * 0.045 +
      Math.sin(vector.z * 5.1 + seed * 13) * 0.035;
    vector.multiplyScalar(wobble);
    position.setXYZ(i, vector.x, vector.y, vector.z);
  }

  geometry.computeVertexNormals();
  return geometry;
}
