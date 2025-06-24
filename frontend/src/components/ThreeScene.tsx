
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { Mesh } from 'three';

interface ThreeSceneProps {
  className?: string;
}

const AnimatedBox: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => {
  const meshRef = useRef<Mesh>(null!);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Box ref={meshRef} position={position} args={[1, 1, 1]}>
      <meshStandardMaterial color={color} />
    </Box>
  );
};

export const ThreeScene: React.FC<ThreeSceneProps> = ({ className }) => {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <AnimatedBox position={[-2, 0, 0]} color="#3b82f6" />
        <AnimatedBox position={[2, 0, 0]} color="#8b5cf6" />
        
        <Text
          position={[0, 2, 0]}
          fontSize={0.5}
          color="#1f2937"
          anchorX="center"
          anchorY="middle"
        >
          Knowledge Graph 3D
        </Text>
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};
