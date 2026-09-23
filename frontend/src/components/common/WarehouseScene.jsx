import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, RoundedBox } from '@react-three/drei';

const Crate = ({ position, size = 1, color, speed = 1, rotationFactor = 1 }) => {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 * speed) * 0.15 * rotationFactor;
    ref.current.rotation.y += 0.0015 * speed;
  });
  return (
    <Float speed={speed} rotationIntensity={0.2} floatIntensity={1.1}>
      <RoundedBox ref={ref} args={[size, size, size]} radius={0.06} smoothness={4} position={position}>
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} />
      </RoundedBox>
    </Float>
  );
};

const Rig = ({ children }) => {
  const group = useRef();
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.2;
  });
  return <group ref={group}>{children}</group>;
};

const Scene = () => (
  <>
    <ambientLight intensity={0.55} />
    <directionalLight position={[4, 6, 4]} intensity={1.1} color="#E8A33D" />
    <directionalLight position={[-5, -2, -3]} intensity={0.35} color="#1F9E8F" />

    <Rig>
      <Crate position={[-1.6, 0.6, 0]} size={1.1} color="#E8A33D" speed={0.9} />
      <Crate position={[1.4, -0.4, -0.6]} size={0.85} color="#1F9E8F" speed={1.2} rotationFactor={1.4} />
      <Crate position={[0.2, 1.3, -1]} size={0.65} color="#EDEDED" speed={1.4} />
      <Crate position={[-0.6, -1.2, 0.4]} size={0.7} color="#C7822A" speed={0.7} />
      <Crate position={[2, 1, 0.8]} size={0.5} color="#63D9CB" speed={1.6} rotationFactor={1.6} />
    </Rig>

    <Sparkles count={60} scale={7} size={1.6} speed={0.3} color="#E8A33D" opacity={0.5} />
  </>
);

const Fallback = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="grid grid-cols-3 gap-3 opacity-70">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="h-10 w-10 animate-pulse-dot rounded-lg"
          style={{
            background: i % 3 === 0 ? '#E8A33D' : i % 3 === 1 ? '#1F9E8F' : '#3a3f47',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  </div>
);

const WarehouseScene = () => (
  <div className="h-full w-full">
    <Suspense fallback={<Fallback />}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Scene />
      </Canvas>
    </Suspense>
  </div>
);

export default WarehouseScene;
