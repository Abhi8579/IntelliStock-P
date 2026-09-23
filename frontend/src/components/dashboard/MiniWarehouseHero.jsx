import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Sparkles } from '@react-three/drei';

const MiniCrate = ({ position, size, color, speed }) => {
  const ref = useRef();
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.004 * speed; });
  return (
    <Float speed={speed} rotationIntensity={0.3} floatIntensity={1.4}>
      <RoundedBox ref={ref} args={[size, size, size]} radius={0.08} position={position}>
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </RoundedBox>
    </Float>
  );
};

const MiniWarehouseHero = () => (
  <Suspense fallback={null}>
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 40 }} gl={{ alpha: true }} onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 3]} intensity={1} color="#E8A33D" />
      <MiniCrate position={[-0.9, 0.3, 0]} size={0.8} color="#E8A33D" speed={1} />
      <MiniCrate position={[0.7, -0.3, -0.4]} size={0.55} color="#1F9E8F" speed={1.4} />
      <MiniCrate position={[0.1, 0.9, -0.6]} size={0.4} color="#EDEDED" speed={1.7} />
      <Sparkles count={25} scale={4} size={1.4} speed={0.3} color="#E8A33D" opacity={0.5} />
    </Canvas>
  </Suspense>
);

export default MiniWarehouseHero;
