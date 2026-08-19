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
import { memoryManager } from "@/lib/memory-manager";

interface SVGModelProps {
  svgData: string;
  depth?: number;
  bevelEnabled?: boolean;
  bevelThickness?: number;
  bevelSize?: number;
  bevelSegments?: number;
  customColor?: string;
  materialPreset?: string;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  envMapIntensity?: number;
  transmission?: number;
  receiveShadow?: boolean;
  castShadow?: boolean;
  isHollowSvg?: boolean;
  spread?: number;
  isMobile?: boolean;
  // Texture properties
  textureEnabled?: boolean;
  texturePreset?: string;
  textureScale?: { x: number; y: number };
  textureDepth?: number;
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
      materialPreset = "custom",
      roughness = 0.3,
      metalness = 0.5,
      clearcoat = 0,
      envMapIntensity = 1,
      transmission = 0,
      receiveShadow = true,
      castShadow = true,
      spread = 0,
      isMobile = false,
      // Texture properties
      textureEnabled = false,
      texturePreset = "oak",
      textureScale = { x: 1, y: 1 },
      textureDepth = 100,
      onLoadStart,
      onLoadComplete,
      onError,
    },
    ref,
  ) => {
    const [paths, setPaths] = useState<THREE.ShapePath[]>([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const groupRef = useRef<THREE.Group>(null);

    const currentTexturePreset = useMemo(
      () => TEXTURE_PRESETS.find((preset) => preset.name === texturePreset),
      [texturePreset],
    );

    useImperativeHandle(ref, () => groupRef.current!, []);

    useEffect(() => {
      if (!svgData) return;

      onLoadStart?.();

      try {
        const processedSvgData = svgData
          .replace(/[™®©]/g, "")
          .replace(/&trade;|&reg;|&copy;/g, "")
          .replace(/currentColor/gi, "#ffffff");

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

    const geometryData = useMemo(() => {
      if (!paths.length) return [];

      return paths
        .map((path, index) => {
          try {
            const shapes = path.toShapes();

            const processedShapes = shapes.map((shape) => {
              return applySpread(shape, false, spread);
            });

            return {
              shapes: processedShapes,
              color: path.color,
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
    }, [paths, spread]);

    const createMaterial = useCallback(
      async (
        color: string | THREE.Color,
        isHole: boolean,
      ): Promise<THREE.MeshPhysicalMaterial> => {
        const threeColor =
          color instanceof THREE.Color ? color : new THREE.Color(color);
        const isTransmissive = transmission > 0;
        const isSmokedGlass = materialPreset === "glass_smoked";
        const materialColor =
          isSmokedGlass && !customColor
            ? new THREE.Color("#050608")
            : isTransmissive && !customColor
              ? new THREE.Color("#ffffff")
              : threeColor;

        const materialProps: THREE.MeshPhysicalMaterialParameters = {
          color: materialColor,
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
          ior: isSmokedGlass ? 1.52 : isTransmissive ? 1.45 : 1.4,
          thickness: isSmokedGlass
            ? Math.max(0.7, depth * 0.22)
            : isTransmissive
              ? Math.max(0.25, depth * 0.15)
              : 0,
          attenuationDistance: isSmokedGlass
            ? Math.max(0.35, depth * 0.12)
            : Infinity,
          attenuationColor: isSmokedGlass
            ? new THREE.Color("#090406")
            : isTransmissive
              ? new THREE.Color(1, 1, 1)
              : new THREE.Color(0, 0, 0),
          specularIntensity: isTransmissive ? 1 : 0.5,
          specularColor: new THREE.Color("#ffffff"),
          dispersion: isSmokedGlass ? 0.012 : 0,
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
          transparent: isHole,
          opacity: isHole ? 0.5 : 1.0,
          depthWrite: true,
        };

        if (
          textureEnabled &&
          currentTexturePreset &&
          typeof window !== "undefined"
        ) {
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
            materialProps.color = new THREE.Color(1, 1, 1).lerp(threeColor, 1);

            if (currentTexturePreset.normalMap) {
              try {
                const normalTexture = await loadTexture(
                  currentTexturePreset.normalMap,
                  {
                    ...textureOptions,
                    colorSpace: THREE.NoColorSpace,
                  },
                );
                materialProps.normalMap = normalTexture;
                const depthFactor = (textureDepth ?? 100) / 100;
                const scaledBumpScale =
                  (currentTexturePreset?.bumpScale || 0.05) * depthFactor * 3.0;
                materialProps.normalScale = new THREE.Vector2(
                  scaledBumpScale,
                  scaledBumpScale,
                );
              } catch {
                // Normal map failed to load, continue without it
              }
            }

            if (currentTexturePreset.roughnessMap) {
              const roughnessTexture = await loadTexture(
                currentTexturePreset.roughnessMap,
                {
                  ...textureOptions,
                  colorSpace: THREE.NoColorSpace,
                },
              );
              materialProps.roughnessMap = roughnessTexture;
            }

            if (currentTexturePreset.aoMap) {
              const aoTexture = await loadTexture(currentTexturePreset.aoMap, {
                ...textureOptions,
                colorSpace: THREE.NoColorSpace,
              });
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

        const material = new THREE.MeshPhysicalMaterial(materialProps);
        memoryManager.track(material);
        return material;
      },
      [
        textureEnabled,
        currentTexturePreset,
        texturePreset,
        customColor,
        materialPreset,
        depth,
        roughness,
        metalness,
        clearcoat,
        transmission,
        envMapIntensity,
        textureScale.x,
        textureScale.y,
        textureDepth,
      ],
    );

    useEffect(() => {
      const currentGroup = groupRef.current;
      return () => {
        if (currentGroup) {
          currentGroup.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              if (object.geometry) {
                memoryManager.untrack(object.geometry);
                object.geometry.dispose();
              }
            }
          });
        }
      };
    }, []);

    const scale = useMemo(() => {
      if (dimensions.width === 0 || dimensions.height === 0) return 1;
      const baseScale = 100 / Math.max(dimensions.width, dimensions.height);
      return isMobile ? baseScale * 0.7 : baseScale;
    }, [dimensions, isMobile]);

    const extrudeSettings = useMemo(() => {
      const makeSettings = (isHole: boolean) => ({
        depth,
        bevelEnabled,
        bevelThickness: isHole ? bevelThickness * 1.05 : bevelThickness,
        bevelSize: isHole ? bevelSize * 1.05 : bevelSize,
        bevelSegments: bevelEnabled
          ? Math.min(12, Math.max(1, bevelSegments))
          : 1,
        curveSegments: Math.min(48, Math.max(16, bevelSegments * 2)),
      });

      return {
        solid: makeSettings(false),
        hole: makeSettings(true),
      };
    }, [depth, bevelEnabled, bevelThickness, bevelSize, bevelSegments]);

    const [xOffset, yOffset] = useMemo(() => {
      if (geometryData.length === 0) return [0, 0];

      const box = new THREE.Box3();
      const tempGroup = new THREE.Group();

      geometryData.forEach((shapeItem) => {
        shapeItem.shapes.forEach((shape) => {
          const geometry = new THREE.ShapeGeometry(shape);
          tempGroup.add(new THREE.Mesh(geometry));
        });
      });

      box.setFromObject(tempGroup);
      tempGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      });
      tempGroup.clear();

      const center = new THREE.Vector3();
      box.getCenter(center);
      return [-center.x, -center.y];
    }, [geometryData]);

    if (geometryData.length === 0) return null;

    return (
      <Center>
        <group
          ref={groupRef}
          scale={[scale, -scale, scale]}
          position={isMobile ? [0, 5, 0] : [0, 0, 0]}
          rotation={[0, Math.PI / 4, 0]}>
          {geometryData.map((shapeItem, i) => (
            <group key={i} renderOrder={shapeItem.renderOrder}>
              {shapeItem.shapes.map((shape, j) => (
                <React.Suspense key={`${i}-${j}`} fallback={null}>
                  <MaterializedMesh
                    key={`${i}-${j}`}
                    shape={shape}
                    color={customColor || shapeItem.color}
                    isHole={shapeItem.isHole}
                    extrudeSettings={
                      shapeItem.isHole
                        ? extrudeSettings.hole
                        : extrudeSettings.solid
                    }
                    position={[
                      xOffset,
                      yOffset,
                      shapeItem.isHole ? -depth / 4 : -depth / 2,
                    ]}
                    castShadow={castShadow}
                    receiveShadow={receiveShadow}
                    renderOrder={shapeItem.renderOrder}
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

function MaterializedMesh({
  shape,
  color,
  isHole,
  extrudeSettings,
  position,
  castShadow,
  receiveShadow,
  renderOrder,
  createMaterial,
}: {
  shape: THREE.Shape;
  color: string | THREE.Color;
  isHole: boolean;
  extrudeSettings: {
    depth: number;
    bevelEnabled: boolean;
    bevelThickness: number;
    bevelSize: number;
    bevelSegments: number;
    curveSegments: number;
  };
  position: [number, number, number];
  castShadow: boolean;
  receiveShadow: boolean;
  renderOrder: number;
  createMaterial: (
    color: string | THREE.Color,
    isHole: boolean,
  ) => Promise<THREE.MeshPhysicalMaterial>;
}) {
  const [material, setMaterial] = useState<THREE.MeshPhysicalMaterial | null>(
    null,
  );

  const geometryRef = useRef<THREE.ExtrudeGeometry | null>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  useEffect(() => {
    let isActive = true;

    createMaterial(color, isHole)
      .then((nextMaterial) => {
        if (!isActive) {
          memoryManager.untrack(nextMaterial);
          nextMaterial.dispose();
          return;
        }

        const previousMaterial = materialRef.current;
        materialRef.current = nextMaterial;
        setMaterial(nextMaterial);

        if (previousMaterial) {
          memoryManager.untrack(previousMaterial);
          previousMaterial.dispose();
        }
      })
      .catch((error) => {
        console.error("Failed to create material:", error);
      });

    return () => {
      isActive = false;
    };
  }, [createMaterial, color, isHole]);

  useEffect(() => {
    return () => {
      if (materialRef.current) {
        memoryManager.untrack(materialRef.current);
        materialRef.current.dispose();
        materialRef.current = null;
      }
      if (geometryRef.current) {
        memoryManager.untrack(geometryRef.current);
        geometryRef.current.dispose();
        geometryRef.current = null;
      }
    };
  }, []);

  if (!material) return null;

  return (
    <mesh
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      renderOrder={renderOrder}
      position={position}>
      <extrudeGeometry
        ref={(geo) => {
          if (geo) memoryManager.track(geo);
          geometryRef.current = geo;
        }}
        args={[shape, extrudeSettings]}
      />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

SVGModel.displayName = "SVGModel";
