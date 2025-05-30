"use client";

import {
  useRef,
  useMemo,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { Center, useTexture } from "@react-three/drei";
import { TEXTURE_PRESETS } from "@/lib/constants";

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
      // isHollowSvg = false,
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
    const materialsCache = useRef<Map<string, THREE.Material>>(new Map());

    // Load textures based on preset
    const currentTexturePreset = TEXTURE_PRESETS.find(
      (preset) => preset.name === texturePreset,
    );

    // Load texture maps conditionally
    const textureUrls = useMemo(() => {
      if (!textureEnabled || !currentTexturePreset) return {};

      return {
        diffuse: currentTexturePreset.diffuseMap,
        normal: currentTexturePreset.normalMap || null,
        roughness: currentTexturePreset.roughnessMap || null,
        ao: currentTexturePreset.aoMap || null,
      };
    }, [textureEnabled, currentTexturePreset]);

    const loadedTextures = useTexture(
      textureEnabled && currentTexturePreset
        ? {
            diffuse: textureUrls.diffuse,
            ...(textureUrls.normal && { normal: textureUrls.normal }),
            ...(textureUrls.roughness && { roughness: textureUrls.roughness }),
            ...(textureUrls.ao && { ao: textureUrls.ao }),
          }
        : {},
    ) as {
      diffuse?: THREE.Texture;
      normal?: THREE.Texture;
      roughness?: THREE.Texture;
      ao?: THREE.Texture;
    };

    const diffuseTexture = textureEnabled
      ? loadedTextures.diffuse || null
      : null;
    const normalTexture = textureEnabled ? loadedTextures.normal || null : null;
    const roughnessTexture = textureEnabled
      ? loadedTextures.roughness || null
      : null;
    const aoTexture = textureEnabled ? loadedTextures.ao || null : null;

    useImperativeHandle(ref, () => groupRef.current!, []);

    useEffect(() => {
      if (!svgData) return;
      const cache = materialsCache.current;

      onLoadStart?.();

      try {
        // Remove special characters and symbols
        const processedSvgData = svgData
          .replace(/[™®©]/g, "") // Remove trademark, registered, and copyright symbols
          .replace(/&trade;|&reg;|&copy;/g, ""); // Remove HTML entities

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

        // Remove text elements containing special characters
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
          const [, , vbWidth, vbHeight] = viewBox
            .split(" ")
            .map(Number.parseFloat);
          width = vbWidth;
          height = vbHeight;
        }

        setDimensions({ width, height });

        const loader = new SVGLoader();
        const svgData2 = loader.parse(svgString);

        setPaths(svgData2.paths);

        setTimeout(() => {
          onLoadComplete?.();
        }, 300);
      } catch (error) {
        console.error("Error parsing SVG:", error);
        onError?.(
          error instanceof Error ? error : new Error("Failed to parse SVG"),
        );
      }

      return () => {
        cache.clear();
      };
    }, [svgData, onLoadStart, onLoadComplete, onError]);

    const shapesWithMaterials = useMemo(() => {
      if (paths.length === 0) return [];

      return paths
        .map((path, index) => {
          try {
            const shapes = SVGLoader.createShapes(path);

            if (shapes.length === 0) {
              console.warn("No shapes created from path", index);
              return null;
            }

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

    const scale = useMemo(() => {
      if (dimensions.width === 0 || dimensions.height === 0) return 1;
      return 100 / Math.max(dimensions.width, dimensions.height);
    }, [dimensions]);

    const getMaterial = (color: string | THREE.Color, isHole: boolean) => {
      const colorString =
        color instanceof THREE.Color ? `#${color.getHexString()}` : color;
      const cacheKey = `${colorString}_${roughness}_${metalness}_${clearcoat}_${transmission}_${envMapIntensity}_${textureEnabled}_${texturePreset}_${textureIntensity}_${textureScale.x}_${textureScale.y}`;

      if (materialsCache.current.has(cacheKey)) {
        return materialsCache.current.get(cacheKey)!;
      }

      const threeColor =
        color instanceof THREE.Color ? color : new THREE.Color(color);

      // Configure textures if enabled
      let configuredDiffuseTexture: THREE.Texture | null = null;
      let configuredNormalTexture: THREE.Texture | null = null;
      let configuredRoughnessTexture: THREE.Texture | null = null;
      let configuredAoTexture: THREE.Texture | null = null;

      if (textureEnabled && currentTexturePreset) {
        // Configure diffuse texture
        if (diffuseTexture && diffuseTexture instanceof THREE.Texture) {
          configuredDiffuseTexture = diffuseTexture.clone();
          configuredDiffuseTexture.wrapS = THREE.RepeatWrapping;
          configuredDiffuseTexture.wrapT = THREE.RepeatWrapping;
          configuredDiffuseTexture.repeat.set(
            currentTexturePreset.repeat.x / textureScale.x,
            currentTexturePreset.repeat.y / textureScale.y,
          );
          configuredDiffuseTexture.colorSpace = THREE.SRGBColorSpace;
        }

        // Configure normal texture
        if (normalTexture && normalTexture instanceof THREE.Texture) {
          configuredNormalTexture = normalTexture.clone();
          configuredNormalTexture.wrapS = THREE.RepeatWrapping;
          configuredNormalTexture.wrapT = THREE.RepeatWrapping;
          configuredNormalTexture.repeat.set(
            currentTexturePreset.repeat.x / textureScale.x,
            currentTexturePreset.repeat.y / textureScale.y,
          );
        }

        // Configure roughness texture
        if (roughnessTexture && roughnessTexture instanceof THREE.Texture) {
          configuredRoughnessTexture = roughnessTexture.clone();
          configuredRoughnessTexture.wrapS = THREE.RepeatWrapping;
          configuredRoughnessTexture.wrapT = THREE.RepeatWrapping;
          configuredRoughnessTexture.repeat.set(
            currentTexturePreset.repeat.x / textureScale.x,
            currentTexturePreset.repeat.y / textureScale.y,
          );
        }

        // Configure AO texture
        if (aoTexture && aoTexture instanceof THREE.Texture) {
          configuredAoTexture = aoTexture.clone();
          configuredAoTexture.wrapS = THREE.RepeatWrapping;
          configuredAoTexture.wrapT = THREE.RepeatWrapping;
          configuredAoTexture.repeat.set(
            currentTexturePreset.repeat.x / textureScale.x,
            currentTexturePreset.repeat.y / textureScale.y,
          );
        }
      }

      const materialProps: THREE.MeshPhysicalMaterialParameters = {
        color:
          textureEnabled && configuredDiffuseTexture
            ? new THREE.Color(1, 1, 1).lerp(threeColor, 1 - textureIntensity)
            : threeColor,
        map: configuredDiffuseTexture,
        normalMap: configuredNormalTexture,
        normalScale: configuredNormalTexture
          ? new THREE.Vector2(
              currentTexturePreset?.bumpScale || 0.02,
              currentTexturePreset?.bumpScale || 0.02,
            )
          : undefined,
        roughnessMap: configuredRoughnessTexture,
        aoMap: configuredAoTexture,
        aoMapIntensity: configuredAoTexture ? 1.0 : 1.0,
        roughness: Math.max(
          0.05,
          textureEnabled && currentTexturePreset?.roughnessAdjust !== undefined
            ? currentTexturePreset.roughnessAdjust
            : roughness,
        ),
        metalness:
          textureEnabled && currentTexturePreset?.metalnessAdjust !== undefined
            ? currentTexturePreset.metalnessAdjust
            : metalness,
        clearcoat: Math.max(clearcoat, 0.05),
        clearcoatRoughness: 0.05,
        reflectivity: 1,
        envMapIntensity,
        transmission,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: isHole ? -1 : 1,
        polygonOffsetUnits: isHole ? -1 : 1,
        flatShading: false,
        wireframe: false,
      };

      const material = new THREE.MeshPhysicalMaterial(materialProps);

      materialsCache.current.set(cacheKey, material);
      return material;
    };

    useEffect(() => {
      const cache = materialsCache.current;
      const group = groupRef.current;
      return () => {
        cache.forEach((material) => {
          if (material) material.dispose();
        });
        cache.clear();

        if (group) {
          group.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              if (object.geometry) object.geometry.dispose();

              if (Array.isArray(object.material)) {
                object.material.forEach((material) => {
                  if (!cache.has(material.uuid)) material.dispose();
                });
              } else if (object.material && !cache.has(object.material.uuid)) {
                object.material.dispose();
              }
            }
          });
        }
      };
    }, []);

    if (shapesWithMaterials.length === 0) return null;

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

    shapesWithMaterials.forEach((shapeItem) => {
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
          {shapesWithMaterials.map((shapeItem, i) => (
            <group key={i} renderOrder={shapeItem.renderOrder}>
              {shapeItem.shapes.map((shape, j) => (
                <mesh
                  key={j}
                  castShadow={castShadow}
                  receiveShadow={receiveShadow}
                  renderOrder={shapeItem.renderOrder}
                  position={[
                    xOffset,
                    yOffset,
                    shapeItem.isHole ? -depth / 4 : -depth / 2,
                  ]}>
                  <extrudeGeometry
                    args={[shape, getExtrudeSettings(shapeItem.isHole)]}
                  />
                  <primitive
                    object={getMaterial(shapeItem.color, shapeItem.isHole)}
                    attach="material"
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      </Center>
    );
  },
);

SVGModel.displayName = "SVGModel";
