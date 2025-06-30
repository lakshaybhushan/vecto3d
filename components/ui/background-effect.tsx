"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Plane } from "@react-three/drei";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  backgroundVariants,
  backgroundCanvasVariants,
} from "@/lib/motion-variants";
import * as THREE from "three";
import { memoryManager } from "@/lib/memory-manager";

const vertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float iTime;
  uniform vec2 iResolution;
  uniform float isDark;
  varying vec2 vUv;
  
  float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);

    float res = mix(
        mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
        mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
    return res*res;
  }

  const mat2 mtx = mat2( 0.80,  0.60, -0.60,  0.80 );

  float fbm( vec2 p )
  {
    float f = 0.0;

    f += 0.500000*noise( p + iTime * 0.25 ); p = mtx*p*2.02;
    f += 0.031250*noise( p ); p = mtx*p*2.01;
    f += 0.250000*noise( p ); p = mtx*p*2.03;
    f += 0.125000*noise( p ); p = mtx*p*2.01;
    f += 0.062500*noise( p ); p = mtx*p*2.04;
    f += 0.015625*noise( p + sin(iTime * 0.4) );

    return f/0.96875;
  }

  float pattern( in vec2 p )
  {
    return fbm( p + fbm( p + fbm( p ) ) );
  }

  void main() {
    vec2 uv = vUv * 3.5;
    float shade = pattern(uv);
    
    if (isDark > 0.5) {
      // Dark mode: more black
      shade = 1.0 - shade;
      shade = pow(shade, 2.2);
      shade = shade * 0.25;
      
      float variation = noise(vUv * 12.0) * 0.05;
      shade = max(0.0, shade + variation);
      shade = min(shade, 0.35);
    } else {
      // Light mode: very white with subtle but visible patterns
      shade = pow(shade, 1.2);
      shade = shade * 0.2 + 0.8; // Much whiter: 80% base + 20% variation
      
      // Add visible but subtle texture variation
      float variation = noise(vUv * 8.0) * 0.08;
      shade = shade + variation;
      shade = max(0.75, min(shade, 1.0)); // Keep it very bright (75-100%)
    }
    
    gl_FragColor = vec4(shade, shade, shade, 1.0);
  }
`;

function BackgroundShader({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const uniforms = useRef({
    iTime: { value: 0 },
    iResolution: {
      value: new THREE.Vector2(dimensions.width, dimensions.height),
    },
    isDark: { value: isDark ? 1.0 : 0.0 },
  });

  useEffect(() => {
    uniforms.current.isDark.value = isDark ? 1.0 : 0.0;
  }, [isDark]);

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDimensions({ width, height });
      uniforms.current.iResolution.value.set(width, height);
    };

    if (typeof window !== "undefined") {
      updateDimensions();
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
    }
  }, []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (mesh) {
      uniforms.current.iTime.value = state.clock.elapsedTime;
    }
  });

  useEffect(() => {
    const material = materialRef.current;
    const mesh = meshRef.current;

    return () => {
      if (material) {
        memoryManager.untrack(material);
        material.dispose();
      }
      if (mesh && mesh.geometry) {
        memoryManager.untrack(mesh.geometry);
        mesh.geometry.dispose();
      }
    };
  }, []);

  const planeWidth = viewport.width;
  const planeHeight = viewport.height;

  return (
    <Plane ref={meshRef} args={[planeWidth, planeHeight]}>
      <shaderMaterial
        ref={(material) => {
          materialRef.current = material;
          if (material) {
            memoryManager.track(material);
          }
        }}
        uniforms={uniforms.current}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={false}
      />
      <ContextEvents />
    </Plane>
  );
}

export default function BackgroundEffect() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;

    return () => {
      if (canvas) {
        const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
        if (gl && gl.getExtension("WEBGL_lose_context")) {
          gl.getExtension("WEBGL_lose_context")?.loseContext();
        }
      }
    };
  }, []);

  const isDark = resolvedTheme === "dark";

  if (!mounted) {
    return (
      <motion.div
        className="bg-background pointer-events-none fixed inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: {
            duration: 0.5,
          },
        }}
      />
    );
  }

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        height: "100vh",
        width: "100vw",
        top: 0,
        left: 0,
      }}
      variants={backgroundVariants}
      initial="initial"
      animate="animate">
      <motion.div
        variants={backgroundCanvasVariants}
        initial="initial"
        animate="animate"
        className="h-full w-full">
        <Canvas
          ref={canvasRef}
          camera={{ position: [0, 0, 1], fov: 75, near: 0.1, far: 1000 }}
          gl={{
            alpha: false,
            antialias: true,
            powerPreference: "high-performance",
          }}
          style={{ background: isDark ? "#000000" : "#ffffff" }}
          dpr={[1, 2]}>
          <BackgroundShader isDark={isDark} />
        </Canvas>
      </motion.div>
    </motion.div>
  );
}

// Component to handle WebGL context lost/restored for the background canvas
function ContextEvents() {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const handleLost = (e: Event) => {
      e.preventDefault();
      console.warn("Background WebGL context lost");
      memoryManager.scheduleCleanup();
    };
    const handleRestored = () => {
      console.info("Background WebGL context restored");
    };
    canvas.addEventListener("webglcontextlost", handleLost, false);
    canvas.addEventListener("webglcontextrestored", handleRestored, false);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleLost);
      canvas.removeEventListener("webglcontextrestored", handleRestored);
    };
  }, [gl]);
  return null;
}
