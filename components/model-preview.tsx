import React, { useRef, useEffect, useMemo, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { ModelPreviewProps } from "@/lib/types";
import { loadThreeModules } from "@/lib/three-imports";

const LazyEnvironment = React.lazy(() =>
  import("./environment-presets").then((module) => ({
    default: module.SimpleEnvironment,
  })),
);
const LazySVGModel = React.lazy(() =>
  import("./svg-model").then((module) => ({ default: module.SVGModel })),
);

interface PostProcessingModules {
  EffectComposer: React.ComponentType<{
    children?: React.ReactNode;
    enabled?: boolean;
    [key: string]: unknown;
  }>;
  Bloom: React.ComponentType<{
    intensity?: number;
    luminanceThreshold?: number;
    luminanceSmoothing?: number;
    mipmapBlur?: boolean;
    radius?: number;
    [key: string]: unknown;
  }>;
  BrightnessContrast: React.ComponentType<{
    brightness?: number;
    contrast?: number;
    blendFunction?: number;
    [key: string]: unknown;
  }>;
  SMAA: React.ComponentType<{
    preset?: number;
    [key: string]: unknown;
  }>;
  ToneMapping: React.ComponentType<{
    adaptive?: boolean;
    resolution?: number;
    middleGrey?: number;
    maxLuminance?: number;
    averageLuminance?: number;
    adaptationRate?: number;
    [key: string]: unknown;
  }>;
  BlendFunction: {
    NORMAL: number;
    [key: string]: number;
  };
}

interface PostProcessingEffectsProps {
  useBloom: boolean;
  bloomIntensity: number;
  bloomMipmapBlur: boolean;
  isMobile: boolean;
}

const PostProcessingEffects: React.FC<PostProcessingEffectsProps> = React.memo(
  ({ useBloom, bloomIntensity, bloomMipmapBlur, isMobile }) => {
    const [modules, setModules] = useState<PostProcessingModules | null>(null);

    useEffect(() => {
      let mounted = true;
      loadThreeModules().then((loadedModules) => {
        if (mounted) {
          setModules(loadedModules as unknown as PostProcessingModules);
        }
      });
      return () => {
        mounted = false;
      };
    }, []);

    if (!modules) return null;

    const {
      EffectComposer,
      Bloom,
      BrightnessContrast,
      SMAA,
      ToneMapping,
      BlendFunction,
    } = modules;

    if (useBloom) {
      return (
        <EffectComposer multisampling={isMobile ? 0 : 8}>
          <SMAA />
          <Bloom
            intensity={bloomIntensity * 0.7}
            luminanceThreshold={0.4}
            luminanceSmoothing={0.95}
            mipmapBlur={bloomMipmapBlur}
            radius={0.9}
          />
          <BrightnessContrast
            brightness={0.07}
            contrast={0.05}
            blendFunction={BlendFunction.NORMAL}
          />
          <ToneMapping
            adaptive
            resolution={256}
            middleGrey={0.6}
            maxLuminance={16.0}
            averageLuminance={1.0}
            adaptationRate={1.0}
          />
        </EffectComposer>
      );
    }

    return (
      <EffectComposer multisampling={isMobile ? 2 : 8}>
        <SMAA preset={isMobile ? 1 : 3} />
        <ToneMapping
          adaptive
          resolution={256}
          middleGrey={0.6}
          maxLuminance={16.0}
          averageLuminance={1.0}
          adaptationRate={1.0}
        />
      </EffectComposer>
    );
  },
);

PostProcessingEffects.displayName = "PostProcessingEffects";

// Main ModelPreviews component
const ModelPreviews = React.memo<ModelPreviewProps>(
  ({
    svgData,
    depth,
    modelRotationY,
    modelGroupRef,
    modelRef,
    bevelEnabled,
    bevelThickness,
    bevelSize,
    bevelSegments,
    isHollowSvg,
    spread,
    useCustomColor,
    customColor,
    roughness,
    metalness,
    clearcoat,
    transmission,
    envMapIntensity,
    backgroundColor,
    useEnvironment,
    environmentPreset,
    customHdriUrl,
    autoRotate,
    autoRotateSpeed,
    useBloom,
    bloomIntensity,
    bloomMipmapBlur,
    isMobile,
  }) => {
    const cameraRef = useRef(
      new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        1,
        1000,
      ),
    );

    useEffect(() => {
      const handleResize = () => {
        if (cameraRef.current) {
          cameraRef.current.aspect = window.innerWidth / window.innerHeight;
          cameraRef.current.updateProjectionMatrix();
        }
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);

    const [orbitControlsModule, setOrbitControlsModule] =
      useState<React.ComponentType<{
        enableDamping?: boolean;
        dampingFactor?: number;
        [key: string]: unknown;
      }> | null>(null);

    useEffect(() => {
      let mounted = true;
      loadThreeModules().then((modules) => {
        if (mounted && modules.OrbitControls) {
          setOrbitControlsModule(modules.OrbitControls);
        }
      });
      return () => {
        mounted = false;
      };
    }, []);

    const environment = useMemo(() => {
      if (!useEnvironment) return null;

      return (
        <Suspense fallback={null}>
          <LazyEnvironment
            environmentPreset={environmentPreset}
            customHdriUrl={customHdriUrl}
          />
        </Suspense>
      );
    }, [useEnvironment, environmentPreset, customHdriUrl]);

    if (!svgData) return null;

    const OrbitControls = orbitControlsModule;

    return (
      <Canvas
        shadows
        camera={{ position: [0, 0, 150], fov: 50 }}
        dpr={[1, isMobile ? 1.5 : 2]} // Optimize DPR for mobile
        frameloop="demand"
        performance={{ min: 0.5 }}
        gl={{
          outputColorSpace: "srgb",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
          alpha: true,
          logarithmicDepthBuffer: true,
          precision: isMobile ? "mediump" : "highp",
          stencil: false,
        }}>
        <color attach="background" args={[backgroundColor]} />
        <ambientLight intensity={0.6 * Math.PI} />
        <directionalLight
          position={[50, 50, 100]}
          intensity={0.8 * Math.PI}
          castShadow={true}
        />
        {environment}
        <group ref={modelGroupRef} rotation={[0, modelRotationY, 0]}>
          <Suspense fallback={<div>Loading...</div>}>
            <LazySVGModel
              svgData={svgData}
              depth={depth * 5}
              bevelEnabled={bevelEnabled}
              bevelThickness={bevelThickness}
              bevelSize={bevelSize}
              bevelSegments={isMobile ? 3 : bevelSegments}
              customColor={useCustomColor ? customColor : undefined}
              roughness={roughness}
              metalness={metalness}
              clearcoat={clearcoat}
              transmission={transmission}
              envMapIntensity={useEnvironment ? envMapIntensity : 0.2}
              receiveShadow={true}
              castShadow={true}
              isHollowSvg={isHollowSvg}
              spread={spread}
              ref={modelRef}
            />
          </Suspense>
        </group>
        <Suspense fallback={null}>
          <PostProcessingEffects
            useBloom={useBloom}
            bloomIntensity={bloomIntensity}
            bloomMipmapBlur={bloomMipmapBlur}
            isMobile={isMobile}
          />
        </Suspense>
        {OrbitControls && (
          <OrbitControls
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
            minDistance={50}
            maxDistance={400}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            target={[0, 0, 0]}
          />
        )}
      </Canvas>
    );
  },
);

ModelPreviews.displayName = "ModelPreviews";

export { ModelPreviews };
