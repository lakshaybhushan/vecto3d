import React, { useRef, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  BrightnessContrast,
  SMAA,
  ToneMapping,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { SVGModel } from "./svg-model";
import { ModelPreviewProps } from "@/lib/types";
import { SimpleEnvironment } from "./environment-presets";

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
        1000
      )
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

    const effects = useMemo(() => {
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
      } else {
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
      }
    }, [useBloom, bloomIntensity, bloomMipmapBlur, isMobile]);

    const environment = useMemo(() => {
      if (!useEnvironment) return null;

      return (
        <SimpleEnvironment
          environmentPreset={environmentPreset}
          customHdriUrl={customHdriUrl}
        />
      );
    }, [useEnvironment, environmentPreset, customHdriUrl]);

    if (!svgData) return null;

    return (
      <Canvas
        shadows
        camera={{ position: [0, 0, 150], fov: 50 }}
        dpr={[1, 2]}
        frameloop="demand"
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
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
          castShadow={false}
        />
        {environment}
        <group ref={modelGroupRef} rotation={[0, modelRotationY, 0]}>
          <SVGModel
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
            receiveShadow={false}
            castShadow={false}
            isHollowSvg={isHollowSvg}
            spread={spread}
            ref={modelRef}
          />
        </group>
        {effects}
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
      </Canvas>
    );
  }
);

ModelPreviews.displayName = "ModelPreviews";

export { ModelPreviews };
