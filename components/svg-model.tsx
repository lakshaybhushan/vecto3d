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
import { Center } from "@react-three/drei";

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
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onError?: (error: Error) => void;
}

// const getPathBoundingArea = (path: THREE.ShapePath) => {
//   if (path.subPaths.length === 0) return 0;

//   let minX = Infinity,
//     minY = Infinity;
//   let maxX = -Infinity,
//     maxY = -Infinity;

//   path.subPaths.forEach((subPath) => {
//     subPath.getPoints().forEach((point) => {
//       minX = Math.min(minX, point.x);
//       minY = Math.min(minY, point.y);
//       maxX = Math.max(maxX, point.x);
//       maxY = Math.max(maxY, point.y);
//     });
//   });

//   return (maxX - minX) * (maxY - minY);
// };

const applySpread = (
  shape: THREE.Shape,
  isHole: boolean,
  amount: number
): THREE.Shape => {
  if (amount === 0) return shape;

  const pts = shape.getPoints();
  if (pts.length < 3) return shape;

  const center = new THREE.Vector2();
  pts.forEach((pt) => center.add(pt));
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
      holePts.forEach((pt) => holeCenter.add(pt));
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

// const isPathInsideAnother = (
//   innerPath: THREE.ShapePath,
//   outerPath: THREE.ShapePath,
// ) => {
//   const innerPoints = innerPath.subPaths.flatMap((sp) => sp.getPoints());
//   if (innerPoints.length === 0) return false;

//   let outerMinX = Infinity,
//     outerMinY = Infinity;
//   let outerMaxX = -Infinity,
//     outerMaxY = -Infinity;

//   outerPath.subPaths.forEach((subPath) => {
//     subPath.getPoints().forEach((point) => {
//       outerMinX = Math.min(outerMinX, point.x);
//       outerMinY = Math.min(outerMinY, point.y);
//       outerMaxX = Math.max(outerMaxX, point.x);
//       outerMaxY = Math.max(outerMaxY, point.y);
//     });
//   });

//   return innerPoints.every(
//     (p) =>
//       p.x > outerMinX && p.x < outerMaxX && p.y > outerMinY && p.y < outerMaxY,
//   );
// };

// const isClosedPath = (path: THREE.ShapePath) => {
//   return path.subPaths.some((subPath) => {
//     const points = subPath.getPoints();
//     return (
//       points.length > 2 &&
//       Math.abs(points[0].x - points[points.length - 1].x) < 0.001 &&
//       Math.abs(points[0].y - points[points.length - 1].y) < 0.001
//     );
//   });
// };

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
      onLoadStart,
      onLoadComplete,
      onError,
    },
    ref
  ) => {
    const [paths, setPaths] = useState<THREE.ShapePath[]>([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const groupRef = useRef<THREE.Group>(null);
    const materialsCache = useRef<Map<string, THREE.Material>>(new Map());

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
          "image/svg+xml"
        );

        const parserError = svgDoc.querySelector("parsererror");
        if (parserError) {
          throw new Error("SVG parse error: " + parserError.textContent);
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
          svgElement.getAttribute("width") || "100"
        );
        let height = Number.parseFloat(
          svgElement.getAttribute("height") || "100"
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
          error instanceof Error ? error : new Error("Failed to parse SVG")
        );
      }

      return () => {
        cache.clear();
      };
    }, [svgData, onLoadStart, onLoadComplete, onError]);

    const shapesWithMaterials = useMemo(() => {
      if (paths.length === 0) return [];

      // Sort paths by area to identify background rectangles vs inner paths
      const pathsWithArea = paths.map((path, index) => {
        try {
          const shapes = SVGLoader.createShapes(path);

          // Calculate the total area of all shapes in this path
          let totalArea = 0;
          shapes.forEach((shape) => {
            const points = shape.getPoints();
            if (points.length >= 3) {
              // Simple polygon area calculation using shoelace formula
              let area = 0;
              for (let i = 0; i < points.length; i++) {
                const j = (i + 1) % points.length;
                area += points[i].x * points[j].y;
                area -= points[j].x * points[i].y;
              }
              totalArea += Math.abs(area) / 2;
            }
          });

          return {
            path,
            shapes,
            area: totalArea,
            originalIndex: index,
          };
        } catch (error) {
          console.warn("Error calculating area for path:", error);
          return {
            path,
            shapes: [],
            area: 0,
            originalIndex: index,
          };
        }
      });

      // Sort by area (largest first) to render background elements first
      pathsWithArea.sort((a, b) => b.area - a.area);

      return pathsWithArea
        .map((pathItem, sortedIndex) => {
          try {
            if (pathItem.shapes.length === 0) {
              console.warn(
                "No shapes created from path",
                pathItem.originalIndex
              );
              return null;
            }

            const processedShapes = pathItem.shapes.map((shape) =>
              applySpread(shape, false, spread)
            );

            // Determine if this is likely a background element based on area and position
            // Background elements are typically the largest areas and often rectangles
            const isBackground =
              sortedIndex === 0 &&
              pathItem.area > 0 &&
              pathsWithArea.length > 1;

            return {
              shapes: processedShapes,
              color: customColor || pathItem.path.color,
              renderOrder: sortedIndex, // Use sorted index for proper layering
              isHole: false,
              isBackground,
              originalIndex: pathItem.originalIndex,
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
        isBackground: boolean;
        originalIndex: number;
      }>;
    }, [paths, customColor, spread]);

    const scale = useMemo(() => {
      if (dimensions.width === 0 || dimensions.height === 0) return 1;
      return 100 / Math.max(dimensions.width, dimensions.height);
    }, [dimensions]);

    const getMaterial = (
      color: string | THREE.Color,
      isHole: boolean,
      renderOrder: number,
      isBackground: boolean
    ) => {
      const colorString =
        color instanceof THREE.Color ? `#${color.getHexString()}` : color;
      const cacheKey = `${colorString}_${roughness}_${metalness}_${clearcoat}_${transmission}_${envMapIntensity}_${renderOrder}_${isBackground}`;

      if (materialsCache.current.has(cacheKey)) {
        return materialsCache.current.get(cacheKey)!;
      }

      const threeColor =
        color instanceof THREE.Color ? color : new THREE.Color(color);

      // Enhanced polygon offset logic to prevent Z-fighting
      let polygonOffsetFactor: number;
      let polygonOffsetUnits: number;

      if (isBackground) {
        // Background elements should be rendered behind
        polygonOffsetFactor = 1;
        polygonOffsetUnits = 1;
      } else {
        // Foreground elements with subtle progressive offsets
        polygonOffsetFactor = -(renderOrder + 1) * 0.5;
        polygonOffsetUnits = -(renderOrder + 1) * 0.5;
      }

      const material = new THREE.MeshPhysicalMaterial({
        color: threeColor,
        roughness: Math.max(0.05, roughness),
        metalness,
        clearcoat: Math.max(clearcoat, 0.05),
        clearcoatRoughness: 0.05,
        reflectivity: 1,
        envMapIntensity,
        transmission,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor,
        polygonOffsetUnits,
        flatShading: false,
        wireframe: false,
        // Add depth testing improvements
        depthTest: true,
        depthWrite: true,
      });

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
            <group
              key={`${shapeItem.originalIndex}-${i}`}
              renderOrder={shapeItem.renderOrder}>
              {shapeItem.shapes.map((shape, j) => {
                // Calculate Z position based on render order to add physical separation
                // Use minimal but effective separation to maintain visual cohesion
                const zOffset = shapeItem.isBackground
                  ? -depth / 2 - 0.02 // Very slight behind positioning
                  : -depth / 2 + shapeItem.renderOrder * 0.01; // Minimal progressive forward positioning

                return (
                  <mesh
                    key={`${shapeItem.originalIndex}-${j}`}
                    castShadow={castShadow}
                    receiveShadow={receiveShadow}
                    renderOrder={shapeItem.renderOrder}
                    position={[xOffset, yOffset, zOffset]}>
                    <extrudeGeometry
                      args={[shape, getExtrudeSettings(shapeItem.isHole)]}
                    />
                    <primitive
                      object={getMaterial(
                        shapeItem.color,
                        shapeItem.isHole,
                        shapeItem.renderOrder,
                        shapeItem.isBackground
                      )}
                      attach="material"
                    />
                  </mesh>
                );
              })}
            </group>
          ))}
        </group>
      </Center>
    );
  }
);

SVGModel.displayName = "SVGModel";
