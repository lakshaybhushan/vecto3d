"use client";

import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { Center } from "@react-three/drei";
import { TEXTURE_PRESETS } from "@/lib/constants";
import { loadTexture } from "@/lib/texture-cache";

interface SVGModelProps {
  svgData: string;
  depth?: number;
  bevelEnabled?: boolean;
  bevelThickness?: number;
  bevelSize?: number;
  bevelSegments?: number;
  customColor?: string;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  envMapIntensity?: number;
  transmission?: number;
  receiveShadow?: boolean;
  castShadow?: boolean;
  isHollowSvg?: boolean;
  spread?: number;
  // Texture properties
  textureEnabled?: boolean;
  texturePreset?: string;
  textureIntensity?: number;
  textureScale?: { x: number; y: number };
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onError?: (error: Error) => void;
}

const applySpread = (
  shape: THREE.Shape,
  isHole: boolean,
  amount: number,
): THREE.Shape => {
  if (amount === 0) return shape;

  const pts = shape.getPoints();
  if (pts.length < 3) return shape;

  const center = new THREE.Vector2();
  for (const pt of pts) {
    center.add(pt);
  }
  center.divideScalar(pts.length);

  const newShape = new THREE.Shape();
  const scaleAmount = isHole ? 1 - amount / 100 : 1;

  const newPoints = pts.map((pt) => {
    const dir = new THREE.Vector2().subVectors(pt, center);
    const scaledDir = dir.multiplyScalar(scaleAmount);
    return center.clone().add(scaledDir);
  });

  newShape.setFromPoints(newPoints);

  if (shape.holes && shape.holes.length > 0) {
    newShape.holes = shape.holes.map((hole) => {
      const holePts = hole.getPoints();
      const holeCenter = new THREE.Vector2();
      for (const pt of holePts) {
        holeCenter.add(pt);
      }
      holeCenter.divideScalar(holePts.length);

      const newHole = new THREE.Path();
      const holeScaleAmount = 1 + amount / 200;

      const newHolePoints = holePts.map((pt) => {
        const dir = new THREE.Vector2().subVectors(pt, holeCenter);
        const scaledDir = dir.multiplyScalar(holeScaleAmount);
        return holeCenter.clone().add(scaledDir);
      });

      newHole.setFromPoints(newHolePoints);
      return newHole;
    });
  }

  return newShape;
};

export const SVGModel = forwardRef<THREE.Group, SVGModelProps>(
  (
    {
      svgData,
      depth = 20,
      bevelEnabled = true,
      bevelThickness = 1,
      bevelSize = 0.5,
      bevelSegments = 3,
      customColor,
      roughness = 0.3,
      metalness = 0.5,
      clearcoat = 0,
      envMapIntensity = 1,
      transmission = 0,
      receiveShadow = true,
      castShadow = true,
      spread = 0,
      // Texture properties
      textureEnabled = false,
      texturePreset = "oak",
      textureIntensity = 1.0,
      textureScale = { x: 1, y: 1 },
      onLoadStart,
      onLoadComplete,
      onError,
    },
    ref,
  ) => {
    const [paths, setPaths] = useState<THREE.ShapePath[]>([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const groupRef = useRef<THREE.Group>(null);
    const materialsRef = useRef<THREE.Material[]>([]);

    // Get current texture preset configuration
    const currentTexturePreset = TEXTURE_PRESETS.find(
      (preset) => preset.name === texturePreset,
    );

    useImperativeHandle(ref, () => groupRef.current!, []);

    // Parse SVG data
    useEffect(() => {
      if (!svgData) return;

      onLoadStart?.();

      try {
        const processedSvgData = svgData
          .replace(/[™®©]/g, "")
          .replace(/&trade;|&reg;|&copy;/g, "");

        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(
          processedSvgData,
          "image/svg+xml",
        );

        const parserError = svgDoc.querySelector("parsererror");
        if (parserError) {
          throw new Error(`SVG parse error: ${parserError.textContent}`);
        }

        const svgElement = svgDoc.querySelector("svg");
        if (!svgElement) {
          throw new Error("Invalid SVG: No SVG element found");
        }

        const textElements = svgDoc.querySelectorAll("text");
        if (textElements.length > 0) {
          textElements.forEach((textEl) => {
            const text = textEl.textContent || "";
            if (/[™®©]|&trade;|&reg;|&copy;/.test(text)) {
              textEl.parentNode?.removeChild(textEl);
            }
          });
        }

        const svgString = new XMLSerializer().serializeToString(svgDoc);
        const viewBox = svgElement.getAttribute("viewBox");
        let width = Number.parseFloat(
          svgElement.getAttribute("width") || "100",
        );
        let height = Number.parseFloat(
          svgElement.getAttribute("height") || "100",
        );

        if (viewBox) {
          const [, , vbWidth, vbHeight] = viewBox.split(" ").map(Number);
          width = vbWidth;
          height = vbHeight;
        }

        setDimensions({ width, height });

        const loader = new SVGLoader();
        const svgResult = loader.parse(svgString);
        setPaths(svgResult.paths);
        onLoadComplete?.();
      } catch (error) {
        console.error("SVG parsing error:", error);
        onError?.(
          error instanceof Error ? error : new Error("SVG parsing failed"),
        );
      }
    }, [svgData, onLoadStart, onLoadComplete, onError]);

    // Optimized geometry generation
    const geometryData = useMemo(() => {
      if (!paths.length) return [];

      return paths
        .map((path, index) => {
          try {
            const shapes = SVGLoader.createShapes(path);
            const processedShapes = shapes.map((shape) =>
              applySpread(shape, false, spread),
            );

            return {
              shapes: processedShapes,
              color: customColor || path.color,
              renderOrder: index,
              isHole: false,
            };
          } catch (error) {
            console.warn("Error creating shapes from path:", error);
            return null;
          }
        })
        .filter(Boolean) as Array<{
        shapes: THREE.Shape[];
        color: string | THREE.Color;
        renderOrder: number;
        isHole: boolean;
      }>;
    }, [paths, customColor, spread]);

    // Clean material creation function
    const createMaterial = useCallback(
      async (
        color: string | THREE.Color,
        isHole: boolean,
      ): Promise<THREE.MeshPhysicalMaterial> => {
        const threeColor =
          color instanceof THREE.Color ? color : new THREE.Color(color);

        const materialProps: THREE.MeshPhysicalMaterialParameters = {
          color: threeColor,
          roughness: Math.max(
            0.01,
            textureEnabled &&
              currentTexturePreset?.roughnessAdjust !== undefined
              ? currentTexturePreset.roughnessAdjust
              : roughness,
          ),
          metalness:
            textureEnabled &&
            currentTexturePreset?.metalnessAdjust !== undefined
              ? currentTexturePreset.metalnessAdjust
              : metalness,
          clearcoat: clearcoat,
          clearcoatRoughness: Math.max(
            0.01,
            clearcoat > 0 ? roughness * 0.3 : 0.01,
          ),
          reflectivity: metalness > 0.5 ? 1.0 : 0.5,
          ior: transmission > 0 ? 1.5 : 1.4,
          thickness: transmission > 0 ? 5.0 : 0.0,
          attenuationDistance: transmission > 0 ? 0.5 : Infinity,
          attenuationColor:
            transmission > 0
              ? new THREE.Color(1, 1, 1)
              : new THREE.Color(0, 0, 0),
          sheen: metalness < 0.1 && roughness > 0.5 ? 0.1 : 0.0,
          sheenRoughness: metalness < 0.1 && roughness > 0.5 ? 0.8 : 0.0,
          sheenColor:
            metalness < 0.1 && roughness > 0.5
              ? new THREE.Color(0.1, 0.1, 0.1)
              : new THREE.Color(0, 0, 0),
          anisotropy: metalness > 0.5 && roughness < 0.3 ? 0.2 : 0.0,
          envMapIntensity: Math.max(0.1, envMapIntensity),
          transmission,
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: isHole ? -1 : 1,
          polygonOffsetUnits: isHole ? -1 : 1,
          flatShading: false,
          wireframe: false,
          transparent: transmission > 0 || isHole,
          opacity: isHole ? 0.5 : 1.0,
        };

        // Apply textures if enabled
        if (textureEnabled && currentTexturePreset) {
          try {
            const textureOptions = {
              wrapS: THREE.RepeatWrapping,
              wrapT: THREE.RepeatWrapping,
              repeat: {
                x: currentTexturePreset.repeat.x / textureScale.x,
                y: currentTexturePreset.repeat.y / textureScale.y,
              },
              generateMipmaps: true,
            };

            // Load diffuse texture
            const diffuseTexture = await loadTexture(
              currentTexturePreset.diffuseMap,
              {
                ...textureOptions,
                colorSpace: THREE.SRGBColorSpace,
              },
            );

            materialProps.map = diffuseTexture;
            materialProps.color = new THREE.Color(1, 1, 1).lerp(
              threeColor,
              1 - textureIntensity,
            );

            // Load normal map if available
            if (currentTexturePreset.normalMap) {
              const normalTexture = await loadTexture(
                currentTexturePreset.normalMap,
                textureOptions,
              );
              materialProps.normalMap = normalTexture;
              materialProps.normalScale = new THREE.Vector2(
                currentTexturePreset?.bumpScale || 0.02,
                currentTexturePreset?.bumpScale || 0.02,
              );
            }

            // Load roughness map if available
            if (currentTexturePreset.roughnessMap) {
              const roughnessTexture = await loadTexture(
                currentTexturePreset.roughnessMap,
                textureOptions,
              );
              materialProps.roughnessMap = roughnessTexture;
            }

            // Load AO map if available
            if (currentTexturePreset.aoMap) {
              const aoTexture = await loadTexture(
                currentTexturePreset.aoMap,
                textureOptions,
              );
              materialProps.aoMap = aoTexture;
              materialProps.aoMapIntensity = 1.0;
            }
          } catch (error) {
            console.warn(
              `Failed to load textures for ${texturePreset}:`,
              error,
            );
          }
        }

        return new THREE.MeshPhysicalMaterial(materialProps);
      },
      [
        textureEnabled,
        currentTexturePreset,
        roughness,
        metalness,
        clearcoat,
        transmission,
        envMapIntensity,
        textureIntensity,
        textureScale.x,
        textureScale.y,
      ],
    );

    // Clean up materials on component props change
    useEffect(() => {
      // Dispose old materials
      materialsRef.current.forEach((material) => {
        material.dispose();
      });
      materialsRef.current = [];
    }, [
      roughness,
      metalness,
      clearcoat,
      transmission,
      envMapIntensity,
      textureEnabled,
      texturePreset,
      textureIntensity,
      textureScale.x,
      textureScale.y,
    ]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        materialsRef.current.forEach((material) => {
          material.dispose();
        });
        materialsRef.current = [];

        if (groupRef.current) {
          groupRef.current.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              if (object.geometry) object.geometry.dispose();
            }
          });
        }
      };
    }, []);

    const scale = useMemo(() => {
      if (dimensions.width === 0 || dimensions.height === 0) return 1;
      return 100 / Math.max(dimensions.width, dimensions.height);
    }, [dimensions]);

    // Create a stable key for material changes
    const materialKey = useMemo(() => {
      return `${textureEnabled}-${texturePreset}-${roughness}-${metalness}-${clearcoat}-${transmission}-${envMapIntensity}-${textureIntensity}-${textureScale.x}-${textureScale.y}`;
    }, [
      textureEnabled,
      texturePreset,
      roughness,
      metalness,
      clearcoat,
      transmission,
      envMapIntensity,
      textureIntensity,
      textureScale.x,
      textureScale.y,
    ]);

    if (geometryData.length === 0) return null;

    const getExtrudeSettings = (isHole: boolean) => ({
      depth,
      bevelEnabled,
      bevelThickness: isHole ? bevelThickness * 1.05 : bevelThickness,
      bevelSize: isHole ? bevelSize * 1.05 : bevelSize,
      bevelSegments: Math.max(4, bevelSegments),
      curveSegments: Math.max(8, bevelSegments * 2),
    });

    const box = new THREE.Box3();
    const tempGroup = new THREE.Group();

    geometryData.forEach((shapeItem) => {
      shapeItem.shapes.forEach((shape) => {
        const geometry = new THREE.ShapeGeometry(shape);
        const mesh = new THREE.Mesh(geometry);
        tempGroup.add(mesh);
      });
    });

    box.setFromObject(tempGroup);
    const size = new THREE.Vector3();
    box.getSize(size);

    const xOffset = size.x / -2;
    const yOffset = size.y / -2;

    return (
      <Center>
        <group
          ref={groupRef}
          scale={[scale, -scale, scale]}
          position={[0, 0, 0]}
          rotation={[0, Math.PI / 4, 0]}>
          {geometryData.map((shapeItem, i) => (
            <group key={i} renderOrder={shapeItem.renderOrder}>
              {shapeItem.shapes.map((shape, j) => (
                <React.Suspense
                  key={`${materialKey}-${i}-${j}`}
                  fallback={null}>
                  <MaterializedMesh
                    key={`${materialKey}-${i}-${j}`}
                    shape={shape}
                    color={shapeItem.color}
                    isHole={shapeItem.isHole}
                    extrudeSettings={getExtrudeSettings(shapeItem.isHole)}
                    position={[
                      xOffset,
                      yOffset,
                      shapeItem.isHole ? -depth / 4 : -depth / 2,
                    ]}
                    castShadow={castShadow}
                    receiveShadow={receiveShadow}
                    renderOrder={shapeItem.renderOrder}
                    onMaterialReady={(mat) => {
                      materialsRef.current.push(mat);
                    }}
                    // Material props
                    roughness={roughness}
                    metalness={metalness}
                    clearcoat={clearcoat}
                    transmission={transmission}
                    envMapIntensity={envMapIntensity}
                    textureEnabled={textureEnabled}
                    texturePreset={texturePreset}
                    textureIntensity={textureIntensity}
                    textureScale={textureScale}
                    currentTexturePreset={currentTexturePreset}
                    createMaterial={createMaterial}
                  />
                </React.Suspense>
              ))}
            </group>
          ))}
        </group>
      </Center>
    );
  },
);

// Helper component to handle async material loading
function MaterializedMesh({
  shape,
  color,
  isHole,
  extrudeSettings,
  position,
  castShadow,
  receiveShadow,
  renderOrder,
  onMaterialReady,
  roughness,
  metalness,
  clearcoat,
  transmission,
  envMapIntensity,
  textureEnabled,
  texturePreset,
  textureIntensity,
  textureScale,
  currentTexturePreset,
  createMaterial,
}: {
  shape: THREE.Shape;
  color: string | THREE.Color;
  isHole: boolean;
  extrudeSettings: any;
  position: [number, number, number];
  castShadow: boolean;
  receiveShadow: boolean;
  renderOrder: number;
  onMaterialReady: (material: THREE.MeshPhysicalMaterial) => void;
  roughness: number;
  metalness: number;
  clearcoat: number;
  transmission: number;
  envMapIntensity: number;
  textureEnabled: boolean;
  texturePreset: string;
  textureIntensity: number;
  textureScale: { x: number; y: number };
  currentTexturePreset: { name: string } | undefined;
  createMaterial: (
    color: string | THREE.Color,
    isHole: boolean,
  ) => Promise<THREE.MeshPhysicalMaterial>;
}) {
  const [material, setMaterial] = useState<THREE.MeshPhysicalMaterial | null>(
    null,
  );

  useEffect(() => {
    createMaterial(color, isHole).then((mat) => {
      setMaterial(mat);
      onMaterialReady(mat);
    });
  }, [createMaterial, color, isHole, onMaterialReady]);

  if (!material) return null;

  return (
    <mesh
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      renderOrder={renderOrder}
      position={position}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

SVGModel.displayName = "SVGModel";
