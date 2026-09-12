import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type SceneLightingProps = {
  reducedMotion: boolean;
};

export function SceneLighting({ reducedMotion }: SceneLightingProps) {
  const cyan = useRef<THREE.PointLight>(null);
  const violet = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;

    if (cyan.current) {
      cyan.current.position.x = Math.sin(t * 0.18) * 5.5;
      cyan.current.position.y = 1.5 + Math.cos(t * 0.22) * 1.2;
    }

    if (violet.current) {
      violet.current.position.z = -4 + Math.sin(t * 0.16) * 2;
      violet.current.intensity = 0.75 + Math.sin(t * 0.45) * 0.12;
    }
  });

  return (
    <>
      <fog attach="fog" args={['#03050c', 10, 38]} />
      <ambientLight intensity={0.28} color="#7aa7ff" />
      <pointLight ref={cyan} position={[3, 3, 5]} color="#4de8ff" intensity={1.8} distance={22} />
      <pointLight ref={violet} position={[-5, -2, -5]} color="#916cff" intensity={0.7} distance={18} />
      <directionalLight position={[2, 5, 4]} color="#dce9ff" intensity={0.75} />
    </>
  );
}
