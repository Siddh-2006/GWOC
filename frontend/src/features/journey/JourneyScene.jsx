import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const ParallaxLayer = React.forwardRef(({ texturePath, depth, opacity = 1, scale = 1 }, ref) => {
  const texture = useTexture(texturePath);

  return (
    <mesh ref={ref} position={[0, 0, depth]} scale={[16 * scale, 9 * scale, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        toneMapped={false}
      />
    </mesh>
  );
});

const JourneyScene = ({ scrollProgress }) => {
  const bgRef = useRef();
  const auraRef = useRef();

  useFrame((state) => {
    if (bgRef.current) {
      bgRef.current.position.y = scrollProgress * 2;
      const time = state.clock.getElapsedTime();
      bgRef.current.position.y += Math.sin(time * 0.4) * 0.05;
    }
    if (auraRef.current) {
      const time = state.clock.getElapsedTime();
      auraRef.current.position.y = scrollProgress * 1.2 + Math.cos(time * 0.3) * 0.1;
      auraRef.current.rotation.z = Math.sin(time * 0.2) * 0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={1.5} />
      <ParallaxLayer
        ref={bgRef}
        texturePath="/assets/journey_light_bg.png"
        depth={-3}
        scale={2.5}
        opacity={0.6}
      />
      <ParallaxLayer
        ref={auraRef}
        texturePath="/assets/journey_light_bg.png"
        depth={-1}
        scale={1.8}
        opacity={0.2}
      />
    </>
  );
};

const JourneyCanvas = ({ scrollProgress }) => {
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    // Basic WebGL support check
    try {
      const canvas = document.createElement('canvas');
      const support = !!(window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      if (!support) setWebglError(true);
    } catch (e) {
      setWebglError(true);
    }
  }, []);

  if (webglError) {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-purple-50">
        <img
          src="/assets/journey_light_bg.png"
          alt="Journey Background"
          className="w-full h-full object-cover opacity-30 mix-blend-multiply"
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{
          antialias: false, // Turn off antialias for better performance/stability
          alpha: true,
          powerPreference: "low-power", // Request low power to avoid context issues
          failIfMajorPerformanceCaveat: false
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            setWebglError(true);
          }, false);
        }}
        onError={() => setWebglError(true)}
      >
        <Suspense fallback={null}>
          <JourneyScene scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default JourneyCanvas;
