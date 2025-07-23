import React, { useEffect, useMemo, useRef, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SimpleEnvironment } from "@/components/previews/environment-presets";
import type { EnvironmentPresetName } from "@/lib/types";
import {
  EffectComposer,
  Bloom,
  BrightnessContrast,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { SVGModel } from "./svg-model";
import { useEditorStore } from "@/lib/store";
import { memoryManager } from "@/lib/memory-manager";

export interface ModelPreviewProps {
  svgData: string;
  modelGroupRef: React.RefObject<THREE.Group | null>;
  modelRef: React.RefObject<THREE.Group | null>;
  isMobile: boolean;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onError?: (error: Error) => void;
}

// string in the format #ffffff or #ffffff00
// output alpha from 0 to 1, or undefined if color has no alpha
const hexaToAlpha = (color: string) => {
  if (color.length < 9) return undefined;
  const alpha = color.slice(7, 9);
  return parseInt(alpha, 16) / 255;
};

const colorPart = (color: string) => {
  return color.slice(0, 7);
};

const CustomBackground = () => {
  const { gl, scene, camera } = useThree();

  const backgroundColor = useEditorStore((state) => state.backgroundColor);
  const useBloom = useEditorStore((state) => state.useBloom);

  useEffect(() => {
    const bg = backgroundColor || "#000000";
    const alpha = hexaToAlpha(bg);
    if (!useBloom) {
      gl.autoClear = true;
    }

    gl.setClearColor(colorPart(bg), alpha);
    gl.render(scene, camera);
  }, [gl, scene, camera, backgroundColor, useBloom]);

  return null;
};

// Helper to attach context lost/restored listeners (Mindful Chase best-practice)
function WebGLContextEvents() {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn("WebGL context lost – attempting cleanup and restore...");
      memoryManager.scheduleCleanup();
    };

    const handleContextRestored = () => {
      console.info("WebGL context restored");
    };

    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    canvas.addEventListener(
      "webglcontextrestored",
      handleContextRestored,
      false,
    );

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
    };
  }, [gl]);

  return null;
}

// Component to capture the canvas reference
function CanvasCapture({
  canvasRef,
}: {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}) {
  const { gl } = useThree();

  useEffect(() => {
    if (canvasRef && gl.domElement) {
      canvasRef.current = gl.domElement;
    }
  }, [gl.domElement, canvasRef]);

  return null;
}

export const ModelPreview = React.memo<ModelPreviewProps>(
  ({ svgData, modelGroupRef, modelRef, isMobile, canvasRef }) => {
    // Use fine-grained selectors for all state
    const depth = useEditorStore((state) => state.depth);
    const modelRotationY = useEditorStore((state) => state.modelRotationY);
    const bevelEnabled = useEditorStore((state) => state.bevelEnabled);
    const bevelThickness = useEditorStore((state) => state.bevelThickness);
    const bevelSize = useEditorStore((state) => state.bevelSize);
    const bevelSegments = useEditorStore((state) => state.bevelSegments);
    const isHollowSvg = useEditorStore((state) => state.isHollowSvg);
    const useCustomColor = useEditorStore((state) => state.useCustomColor);
    const customColor = useEditorStore((state) => state.customColor);
    const roughness = useEditorStore((state) => state.roughness);
    const metalness = useEditorStore((state) => state.metalness);
    const clearcoat = useEditorStore((state) => state.clearcoat);
    const transmission = useEditorStore((state) => state.transmission);
    const envMapIntensity = useEditorStore((state) => state.envMapIntensity);
    const textureEnabled = useEditorStore((state) => state.textureEnabled);
    const texturePreset = useEditorStore((state) => state.texturePreset);
    const textureScale = useEditorStore((state) => state.textureScale);
    const useEnvironment = useEditorStore((state) => state.useEnvironment);
    const environmentPreset = useEditorStore(
      (state) => state.environmentPreset,
    );
    const customHdriUrl = useEditorStore((state) => state.customHdriUrl);
    const autoRotate = useEditorStore((state) => state.autoRotate);
    const autoRotateSpeed = useEditorStore((state) => state.autoRotateSpeed);
    const useBloom = useEditorStore((state) => state.useBloom);
    const bloomIntensity = useEditorStore((state) => state.bloomIntensity);
    const bloomMipmapBlur = useEditorStore((state) => state.bloomMipmapBlur);

    const cameraRef = useRef(
      new THREE.PerspectiveCamera(
        50,
        typeof window !== "undefined"
          ? window.innerWidth / window.innerHeight
          : 1,
        1,
        1000,
      ),
    );

    useEffect(() => {
      // Track the camera with memory manager
      const camera = cameraRef.current;
      if (camera) {
        memoryManager.track(camera);
      }

      const handleResize = () => {
        if (camera) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        }
      };
      if (typeof window !== "undefined") {
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => {
          window.removeEventListener("resize", handleResize);
          // Cleanup camera when component unmounts
          if (camera) {
            memoryManager.untrack(camera);
          }
        };
      }
    }, []);

    const effects = useMemo(() => {
      const msaaSamples = isMobile ? 4 : 8; // 4 samples for mobile, 8 for desktop

      if (useBloom) {
        return (
          <EffectComposer multisampling={msaaSamples}>
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
          </EffectComposer>
        );
      }

      return null;
    }, [useBloom, bloomIntensity, bloomMipmapBlur, isMobile]);

    const environment = useMemo(() => {
      if (!useEnvironment) return null;

      return (
        <SimpleEnvironment
          environmentPreset={environmentPreset as EnvironmentPresetName}
          customHdriUrl={customHdriUrl}
        />
      );
    }, [useEnvironment, environmentPreset, customHdriUrl]);

    if (!svgData) return null;

    return (
      <Canvas
        shadows
        camera={{
          position: isMobile ? [0, 20, 180] : [0, 0, 150],
          fov: isMobile ? 65 : 50,
        }}
        dpr={
          typeof window !== "undefined" ? window?.devicePixelRatio || 1.5 : 1.5
        }
        frameloop="always"
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          outputColorSpace: "srgb",
          toneMapping: THREE.AgXToneMapping,
          toneMappingExposure: 1.0,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
          alpha: true,
          logarithmicDepthBuffer: false,
          precision: isMobile ? "mediump" : "highp",
          stencil: false,
        }}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}>
        <Suspense fallback={null}>
          <CustomBackground />
          {/* Attach WebGL context event listeners */}
          <WebGLContextEvents />
          {/* Capture canvas reference for video recording */}
          <CanvasCapture canvasRef={canvasRef} />

          <ambientLight intensity={0.4} color="#ffffff" />

          <directionalLight
            position={[10, 10, 5]}
            intensity={2.0}
            color="#ffffff"
            castShadow={false}
          />

          <directionalLight
            position={[-10, -10, -5]}
            intensity={0.5}
            color="#d4edff"
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
              spread={0}
              isMobile={isMobile}
              ref={modelRef}
              // Texture settings
              textureEnabled={textureEnabled}
              texturePreset={texturePreset}
              textureScale={textureScale}
            />
          </group>
        </Suspense>

        {effects}

        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          minDistance={isMobile ? 80 : 50}
          maxDistance={isMobile ? 500 : 400}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[0, 0, 0]}
        />
      </Canvas>
    );
  },
);

ModelPreview.displayName = "ModelPreview";

export default ModelPreview;
