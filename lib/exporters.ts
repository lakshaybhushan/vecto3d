import * as THREE from "three";
import React from "react";
import { toast } from "sonner";
import { loadThreeModules } from "./three-imports";
import { TEXTURE_PRESETS } from "./constants";
import { loadTexture } from "./texture-cache";
import type { TextureExportState } from "./types";
import { VideoRecorder, downloadRecording } from "./video-recorder";

export async function prepareMaterialWithTextures(
  material: THREE.MeshPhysicalMaterial,
  textureEnabled: boolean,
  texturePreset: string,
  textureScale: { x: number; y: number },
): Promise<THREE.MeshPhysicalMaterial> {
  if (!textureEnabled) {
    return material;
  }

  const currentTexturePreset = TEXTURE_PRESETS.find(
    (preset) => preset.name === texturePreset,
  );

  if (!currentTexturePreset) {
    return material;
  }

  const clonedMaterial = material.clone();

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

    const diffuseTexture = await loadTexture(currentTexturePreset.diffuseMap, {
      ...textureOptions,
      colorSpace: THREE.SRGBColorSpace,
    });

    clonedMaterial.map = diffuseTexture;

    if (currentTexturePreset.normalMap) {
      const normalTexture = await loadTexture(
        currentTexturePreset.normalMap,
        textureOptions,
      );
      clonedMaterial.normalMap = normalTexture;
      clonedMaterial.normalScale = new THREE.Vector2(
        currentTexturePreset?.bumpScale || 0.02,
        currentTexturePreset?.bumpScale || 0.02,
      );
    }

    if (currentTexturePreset.roughnessMap) {
      const roughnessTexture = await loadTexture(
        currentTexturePreset.roughnessMap,
        textureOptions,
      );
      clonedMaterial.roughnessMap = roughnessTexture;
    }

    if (currentTexturePreset.aoMap) {
      const aoTexture = await loadTexture(
        currentTexturePreset.aoMap,
        textureOptions,
      );
      clonedMaterial.aoMap = aoTexture;
      clonedMaterial.aoMapIntensity = 1.0;
    }

    clonedMaterial.userData = {
      ...clonedMaterial.userData,
      textureEnabled: true,
      texturePreset: texturePreset,
      textureScale: textureScale,
      textureMaps: {
        diffuse: currentTexturePreset.diffuseMap,
        normal: currentTexturePreset.normalMap,
        roughness: currentTexturePreset.roughnessMap,
        ao: currentTexturePreset.aoMap,
      },
    };

    if (currentTexturePreset.roughnessAdjust !== undefined) {
      clonedMaterial.roughness = currentTexturePreset.roughnessAdjust;
    }

    if (currentTexturePreset.metalnessAdjust !== undefined) {
      clonedMaterial.metalness = currentTexturePreset.metalnessAdjust;
    }

    clonedMaterial.needsUpdate = true;
  } catch (error) {
    console.warn(`Failed to load textures for export:`, error);
  }

  return clonedMaterial;
}

export function prepareModelForExport(
  model: THREE.Object3D,
  format?: "stl" | "gltf" | "glb",
): THREE.Object3D {
  const clonedModel = model.clone();

  clonedModel.matrixWorld.copy(model.matrixWorld);
  clonedModel.matrix.copy(model.matrix);

  if (format === "stl") {
    clonedModel.position.set(0, 0, 0);
    clonedModel.rotation.set(0, 0, 0);
    clonedModel.scale.set(1, 1, 1);

    clonedModel.rotation.x = THREE.MathUtils.degToRad(90);
    clonedModel.rotation.y = THREE.MathUtils.degToRad(0);
    clonedModel.rotation.z = THREE.MathUtils.degToRad(0);
  }

  clonedModel.updateMatrix();
  clonedModel.updateMatrixWorld(true);

  if (format === "gltf" || format === "glb") {
    const meshes: THREE.Mesh[] = [];
    clonedModel.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        meshes.push(object as THREE.Mesh);
      }
    });

    meshes.forEach((mesh) => {
      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((mat) => {
          const physMat = mat as THREE.MeshPhysicalMaterial;

          const isHole = Boolean(
            physMat.userData?.isHole ||
              mesh.userData?.isHole ||
              physMat.polygonOffsetFactor < 0,
          );

          const newMat = physMat.clone();

          newMat.color = physMat.color.clone();
          newMat.roughness = physMat.roughness;
          newMat.metalness = physMat.metalness;
          newMat.clearcoat = physMat.clearcoat;
          newMat.clearcoatRoughness = physMat.clearcoatRoughness;
          newMat.transmission = physMat.transmission;
          newMat.ior = physMat.ior;
          newMat.sheen = physMat.sheen;
          newMat.sheenRoughness = physMat.sheenRoughness;

          if (physMat.sheenColor)
            newMat.sheenColor = physMat.sheenColor.clone();
          if (physMat.emissive) newMat.emissive = physMat.emissive.clone();
          if (physMat.attenuationColor)
            newMat.attenuationColor = physMat.attenuationColor.clone();

          newMat.userData = {
            ...physMat.userData,
            originalProperties: {
              color: physMat.color.getHex(),
              roughness: physMat.roughness,
              metalness: physMat.metalness,
              clearcoat: physMat.clearcoat,
              clearcoatRoughness: physMat.clearcoatRoughness,
              transmission: physMat.transmission,
              ior: physMat.ior,
              opacity: physMat.opacity,
              sheen: physMat.sheen,
              sheenRoughness: physMat.sheenRoughness,
            },
            isHole: isHole,
          };

          if (isHole) {
            newMat.transparent = true;
            newMat.opacity = 0.5;
            newMat.depthWrite = false;
            newMat.polygonOffset = true;
            newMat.polygonOffsetFactor = -2;
            newMat.polygonOffsetUnits = 1;
          }

          newMat.needsUpdate = true;
          return newMat;
        });
      } else if (mesh.material) {
        const physMat = mesh.material as THREE.MeshPhysicalMaterial;

        const isHole = Boolean(
          physMat.userData?.isHole ||
            mesh.userData?.isHole ||
            physMat.polygonOffsetFactor < 0,
        );

        const newMat = physMat.clone();

        newMat.color = physMat.color.clone();
        newMat.roughness = physMat.roughness;
        newMat.metalness = physMat.metalness;
        newMat.clearcoat = physMat.clearcoat;
        newMat.clearcoatRoughness = physMat.clearcoatRoughness;
        newMat.transmission = physMat.transmission;
        newMat.ior = physMat.ior;
        newMat.sheen = physMat.sheen;
        newMat.sheenRoughness = physMat.sheenRoughness;

        if (physMat.sheenColor) newMat.sheenColor = physMat.sheenColor.clone();
        if (physMat.emissive) newMat.emissive = physMat.emissive.clone();
        if (physMat.attenuationColor)
          newMat.attenuationColor = physMat.attenuationColor.clone();

        newMat.userData = {
          ...physMat.userData,
          originalProperties: {
            color: physMat.color.getHex(),
            roughness: physMat.roughness,
            metalness: physMat.metalness,
            clearcoat: physMat.clearcoat,
            clearcoatRoughness: physMat.clearcoatRoughness,
            transmission: physMat.transmission,
            ior: physMat.ior,
            opacity: physMat.opacity,
            sheen: physMat.sheen,
            sheenRoughness: physMat.sheenRoughness,
          },
          isHole: isHole,
        };

        if (isHole) {
          newMat.transparent = true;
          newMat.opacity = 0.5;
          newMat.depthWrite = false;
          newMat.polygonOffset = true;
          newMat.polygonOffsetFactor = -2;
          newMat.polygonOffsetUnits = 1;
        }

        newMat.needsUpdate = true;
        mesh.material = newMat;

        if (isHole) {
          const zOffset = 0.05;
          const scaleUp = 1.01;
          mesh.scale.set(scaleUp, scaleUp, scaleUp + zOffset);
          mesh.updateMatrix();
        }
      }
    });

    return clonedModel;
  }

  const cleanMaterials = new Map<string, THREE.Material>();

  clonedModel.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      const mesh = object as THREE.Mesh;
      const originalMaterial = mesh.material as THREE.MeshPhysicalMaterial;

      const isHole = Boolean(
        originalMaterial.userData?.isHole ||
          mesh.userData?.isHole ||
          originalMaterial?.polygonOffsetFactor < 0,
      );

      const materialKey = isHole ? "hole" : originalMaterial.uuid;

      if (!cleanMaterials.has(materialKey)) {
        const cleanMaterial = new THREE.MeshPhysicalMaterial({
          color: originalMaterial.color,
          roughness: originalMaterial.roughness,
          metalness: originalMaterial.metalness,
          clearcoat: originalMaterial.clearcoat,
          clearcoatRoughness: originalMaterial.clearcoatRoughness,
          transmission: originalMaterial.transmission,
          transparent: isHole || originalMaterial.transparent,
          opacity: isHole ? 0.5 : originalMaterial.opacity,
          side: originalMaterial.side,
          envMapIntensity: originalMaterial.envMapIntensity,
          depthWrite: !isHole,
          polygonOffset: true,
          polygonOffsetFactor: isHole ? -2 : 1,
          polygonOffsetUnits: 1,
        });

        cleanMaterial.userData = {
          ...originalMaterial.userData,
        };

        cleanMaterials.set(materialKey, cleanMaterial);
      }

      mesh.material = cleanMaterials.get(materialKey)!;
      mesh.userData = { ...mesh.userData, ...originalMaterial.userData };

      if (isHole) {
        const zOffset = 0.05;
        const scaleUp = 1.01;
        mesh.scale.set(scaleUp, scaleUp, scaleUp + zOffset);
        mesh.updateMatrix();
      }
    }
  });

  return clonedModel;
}

export function cleanupExportedModel(model: THREE.Object3D): void {
  model.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      if (object.geometry) {
        object.geometry.dispose();
      }

      if (Array.isArray(object.material)) {
        for (const material of object.material) {
          material.dispose();
        }
      } else if (object.material) {
        object.material.dispose();
      }
    }
  });
}

export async function exportToSTL(
  model: THREE.Object3D,
  fileName: string,
): Promise<boolean> {
  try {
    const exportModel = prepareModelForExport(model, "stl");
    const modules = await loadThreeModules();

    const exporter = new modules.STLExporter();
    const result = exporter.parse(exportModel, {
      binary: true,
    });

    cleanupExportedModel(exportModel);

    const blob = new Blob([result], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();

    return true;
  } catch (error) {
    console.error("Error exporting to STL:", error);
    return false;
  }
}

export async function prepareSTL(model: THREE.Object3D): Promise<Blob | null> {
  try {
    const exportModel = prepareModelForExport(model, "stl");
    const modules = await loadThreeModules();

    const exporter = new modules.STLExporter();
    const result = exporter.parse(exportModel, {
      binary: true,
    });

    cleanupExportedModel(exportModel);

    const blob = new Blob([result], { type: "application/octet-stream" });
    return blob;
  } catch (error) {
    console.error("Error exporting to STL:", error);
    return null;
  }
}

export async function exportToGLTFWithTextures(
  model: THREE.Object3D,
  fileName: string,
  format: "gltf" | "glb" = "glb",
  editorState?: TextureExportState,
): Promise<boolean> {
  try {
    const exportModel = prepareModelForExport(model, format);
    const modules = await loadThreeModules();

    const materialProcessingPromises: Promise<void>[] = [];

    exportModel.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const mesh = object as THREE.Mesh;

        const processMaterial = async (material: THREE.Material) => {
          if (material.userData?.originalProperties) {
            const physMaterial = material as THREE.MeshPhysicalMaterial;
            const props = material.userData.originalProperties;

            const isHole = Boolean(
              material.userData?.isHole ||
                mesh.userData?.isHole ||
                physMaterial.polygonOffsetFactor < 0,
            );

            if (props.color !== undefined)
              physMaterial.color.setHex(props.color);
            if (props.roughness !== undefined)
              physMaterial.roughness = props.roughness;
            if (props.metalness !== undefined)
              physMaterial.metalness = props.metalness;
            if (props.clearcoat !== undefined)
              physMaterial.clearcoat = props.clearcoat;
            if (props.clearcoatRoughness !== undefined)
              physMaterial.clearcoatRoughness = props.clearcoatRoughness;
            if (props.transmission !== undefined)
              physMaterial.transmission = props.transmission;
            if (props.ior !== undefined) physMaterial.ior = props.ior;
            if (props.opacity !== undefined)
              physMaterial.opacity = props.opacity;
            if (props.sheen !== undefined) physMaterial.sheen = props.sheen;
            if (props.sheenRoughness !== undefined)
              physMaterial.sheenRoughness = props.sheenRoughness;

            if (editorState?.textureEnabled && !isHole) {
              const enhancedMaterial = await prepareMaterialWithTextures(
                physMaterial,
                editorState.textureEnabled,
                editorState.texturePreset,
                editorState.textureScale,
              );

              enhancedMaterial.userData = {
                ...enhancedMaterial.userData,
                isHole: isHole,
              };

              if (Array.isArray(mesh.material)) {
                const index = mesh.material.indexOf(material);
                if (index !== -1) {
                  mesh.material[index] = enhancedMaterial;
                }
              } else {
                mesh.material = enhancedMaterial;
              }
            }

            if (isHole) {
              physMaterial.transparent = true;
              physMaterial.opacity = 0.5;
              physMaterial.depthWrite = false;
              physMaterial.polygonOffset = true;
              physMaterial.polygonOffsetFactor = -2;
              physMaterial.polygonOffsetUnits = 1;
              physMaterial.userData = {
                ...physMaterial.userData,
                isHole: true,
              };
            }

            physMaterial.needsUpdate = true;
          }
        };

        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => {
            materialProcessingPromises.push(processMaterial(material));
          });
        } else if (mesh.material) {
          materialProcessingPromises.push(processMaterial(mesh.material));
        }
      }
    });

    await Promise.all(materialProcessingPromises);

    const exporter = new modules.GLTFExporter();
    const options = {
      binary: format === "glb",
      trs: true,
      onlyVisible: true,
      embedImages: true,
      includeCustomExtensions: true,
      animations: [],
      forceIndices: true,
      processPendingMaterials: (
        materials: Map<THREE.Material, THREE.Material>,
      ) => {
        return materials;
      },
    };

    const gltfData = await new Promise<ArrayBuffer | object>((resolve) => {
      exporter.parse(
        exportModel,
        (result: ArrayBuffer | object) => resolve(result),
        (error: Error) => {
          console.error("GLTFExporter error:", error);
          throw error;
        },
        options,
      );
    });

    cleanupExportedModel(exportModel);

    let blob: Blob;
    if (format === "glb") {
      blob = new Blob([gltfData as ArrayBuffer], {
        type: "application/octet-stream",
      });
    } else {
      const jsonStr = JSON.stringify(gltfData, null, 2);
      blob = new Blob([jsonStr], { type: "application/json" });
    }

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();

    return true;
  } catch (error) {
    console.error(`Error exporting to ${format.toUpperCase()}:`, error);
    return false;
  }
}

export async function exportToGLTF(
  model: THREE.Object3D,
  fileName: string,
  format: "gltf" | "glb" = "glb",
): Promise<boolean> {
  try {
    const exportModel = prepareModelForExport(model, format);
    const modules = await loadThreeModules();

    exportModel.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const mesh = object as THREE.Mesh;

        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => {
            if (material.userData?.originalProperties) {
              const physMaterial = material as THREE.MeshPhysicalMaterial;
              const props = material.userData.originalProperties;

              if (props.color !== undefined)
                physMaterial.color.setHex(props.color);
              if (props.roughness !== undefined)
                physMaterial.roughness = props.roughness;
              if (props.metalness !== undefined)
                physMaterial.metalness = props.metalness;
              if (props.clearcoat !== undefined)
                physMaterial.clearcoat = props.clearcoat;
              if (props.clearcoatRoughness !== undefined)
                physMaterial.clearcoatRoughness = props.clearcoatRoughness;
              if (props.transmission !== undefined)
                physMaterial.transmission = props.transmission;
              if (props.ior !== undefined) physMaterial.ior = props.ior;
              if (props.opacity !== undefined)
                physMaterial.opacity = props.opacity;
              if (props.sheen !== undefined) physMaterial.sheen = props.sheen;
              if (props.sheenRoughness !== undefined)
                physMaterial.sheenRoughness = props.sheenRoughness;

              physMaterial.needsUpdate = true;
            }
          });
        } else if (
          mesh.material &&
          mesh.material.userData?.originalProperties
        ) {
          const physMaterial = mesh.material as THREE.MeshPhysicalMaterial;
          const props = mesh.material.userData.originalProperties;

          if (props.color !== undefined) physMaterial.color.setHex(props.color);
          if (props.roughness !== undefined)
            physMaterial.roughness = props.roughness;
          if (props.metalness !== undefined)
            physMaterial.metalness = props.metalness;
          if (props.clearcoat !== undefined)
            physMaterial.clearcoat = props.clearcoat;
          if (props.clearcoatRoughness !== undefined)
            physMaterial.clearcoatRoughness = props.clearcoatRoughness;
          if (props.transmission !== undefined)
            physMaterial.transmission = props.transmission;
          if (props.ior !== undefined) physMaterial.ior = props.ior;
          if (props.opacity !== undefined) physMaterial.opacity = props.opacity;
          if (props.sheen !== undefined) physMaterial.sheen = props.sheen;
          if (props.sheenRoughness !== undefined)
            physMaterial.sheenRoughness = props.sheenRoughness;

          physMaterial.needsUpdate = true;
        }
      }
    });

    const exporter = new modules.GLTFExporter();
    const options = {
      binary: format === "glb",
      trs: true,
      onlyVisible: true,
      embedImages: true,
      includeCustomExtensions: true,
      animations: [],
      forceIndices: true,
      processPendingMaterials: (
        materials: Map<THREE.Material, THREE.Material>,
      ) => {
        return materials;
      },
    };

    const gltfData = await new Promise<ArrayBuffer | object>((resolve) => {
      exporter.parse(
        exportModel,
        (result: ArrayBuffer | object) => resolve(result),
        (error: Error) => {
          console.error("GLTFExporter error:", error);
          throw error;
        },
        options,
      );
    });

    cleanupExportedModel(exportModel);

    let blob: Blob;
    if (format === "glb") {
      blob = new Blob([gltfData as ArrayBuffer], {
        type: "application/octet-stream",
      });
    } else {
      const jsonStr = JSON.stringify(gltfData, null, 2);
      blob = new Blob([jsonStr], { type: "application/json" });
    }

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();

    return true;
  } catch (error) {
    console.error(`Error exporting to ${format.toUpperCase()}:`, error);
    return false;
  }
}

export async function exportToVideo(
  canvas: HTMLCanvasElement,
  fileName: string,
  format: "mp4" | "gif",
  duration: number = 5000,
  fps: number = 30,
): Promise<boolean> {
  try {
    if (!canvas) {
      throw new Error("Canvas not found");
    }

    const recorder = new VideoRecorder(canvas, {
      format,
      fps,
      quality: 0.9,
    });

    await recorder.start();

    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const blob = await recorder.stop();

          if (blob) {
            const extension = format === "mp4" ? "webm" : "gif";
            downloadRecording(blob, `${fileName}.${extension}`);
            resolve(true);
          } else {
            throw new Error("Failed to generate video blob");
          }
        } catch (error) {
          console.error("Recording error:", error);
          resolve(false);
        }
      }, duration);
    });
  } catch (error) {
    console.error("Export video error:", error);
    toast.error(`Failed to export ${format.toUpperCase()}: ${error}`);
    return false;
  }
}

export async function exportToMP4(
  canvas: HTMLCanvasElement,
  fileName: string,
  duration: number = 5000,
  fps: number = 30,
): Promise<boolean> {
  return exportToVideo(canvas, fileName, "mp4", duration, fps);
}

export async function exportToGIF(
  canvas: HTMLCanvasElement,
  fileName: string,
  duration: number = 3000,
  fps: number = 15,
): Promise<boolean> {
  return exportToVideo(canvas, fileName, "gif", duration, fps);
}

export async function exportToPNG(
  modelGroupRef: React.RefObject<THREE.Group | null>,
  fileName: string,
  resolution: number = 1,
): Promise<boolean> {
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    toast.error("Could not find the 3D renderer");
    return false;
  }

  try {
    const exportCanvas = document.createElement("canvas");
    const ctx = exportCanvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get 2D context for export canvas");
    }

    exportCanvas.width = canvas.width * resolution;
    exportCanvas.height = canvas.height * resolution;

    const renderer = (
      document.querySelector("canvas") as HTMLCanvasElement & {
        __r3f?: {
          fiber?: {
            renderer: THREE.WebGLRenderer & {
              scene: THREE.Scene;
              camera: THREE.Camera;
            };
          };
        };
      }
    )?.__r3f?.fiber?.renderer;

    if (renderer) {
      const currentPixelRatio = renderer.getPixelRatio();
      renderer.setPixelRatio(currentPixelRatio * resolution);
      renderer.render(renderer.scene, renderer.camera);
      ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
      renderer.setPixelRatio(currentPixelRatio);
      renderer.render(renderer.scene, renderer.camera);
      renderer.renderLists.dispose();
    } else {
      ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
    }

    const dataURL = exportCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${fileName}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup temporary resources
    exportCanvas.remove();
    if (ctx) {
      ctx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
    }

    // Note: Don't revoke dataURL from toDataURL as it's not a blob URL
    return true;
  } catch (error) {
    console.error("Error exporting PNG:", error);
    toast.error("Failed to generate image");
    return false;
  }
}

export async function handleExportWithTextures(
  format: "stl" | "gltf" | "glb" | "png" | "mp4" | "gif",
  modelGroupRef: React.RefObject<THREE.Group | null>,
  fileName: string,
  resolution: number = 1,
  textureState?: TextureExportState,
  canvas?: HTMLCanvasElement,
): Promise<void> {
  const baseName = fileName.replace(".svg", "");

  if (!modelGroupRef.current || !fileName) {
    console.error("Export failed: Model group or filename missing");
    toast.error("Export failed: Model or filename missing");
    return;
  }

  const model = modelGroupRef.current;

  try {
    let success = false;

    switch (format) {
      case "stl":
        success = await exportToSTL(model, `${baseName}.stl`);
        break;
      case "gltf":
        if (textureState?.textureEnabled) {
          success = await exportToGLTFWithTextures(
            model,
            `${baseName}.gltf`,
            "gltf",
            textureState,
          );
        } else {
          success = await exportToGLTF(model, `${baseName}.gltf`, "gltf");
        }
        break;
      case "glb":
        if (textureState?.textureEnabled) {
          success = await exportToGLTFWithTextures(
            model,
            `${baseName}.glb`,
            "glb",
            textureState,
          );
        } else {
          success = await exportToGLTF(model, `${baseName}.glb`, "glb");
        }
        break;
      case "png":
        success = await exportToPNG(modelGroupRef, baseName, resolution);
        break;
      case "mp4":
        if (!canvas) {
          console.error("Canvas not provided for video export");
          toast.error("Error: Canvas not available for video export");
          return;
        }
        success = await exportToMP4(canvas, baseName);
        break;
      case "gif":
        if (!canvas) {
          console.error("Canvas not provided for GIF export");
          toast.error("Error: Canvas not available for GIF export");
          return;
        }
        success = await exportToGIF(canvas, baseName);
        break;
      default:
        console.error(`Unsupported export format: ${format}`);
        toast.error(`Unsupported export format: ${format}`);
        return;
    }

    if (success) {
      toast.success(
        `Successfully exported as ${format.toUpperCase()}${
          textureState?.textureEnabled ? " with textures" : ""
        }`,
      );
    } else {
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    }
  } catch (error) {
    console.error(`Export error (${format}):`, error);
    toast.error(
      `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function handleExport(
  format: "stl" | "gltf" | "glb" | "png" | "mp4" | "gif",
  modelGroupRef: React.RefObject<THREE.Group | null>,
  fileName: string,
  resolution: number = 1,
  canvas?: HTMLCanvasElement,
): Promise<void> {
  const baseName = fileName.replace(".svg", "");

  if (!modelGroupRef.current || !fileName) {
    console.error("Export failed: Model group or filename missing");
    toast.error("Error: Cannot export - model not loaded");
    return;
  }

  try {
    let success = false;

    if (format === "png") {
      success = await exportToPNG(modelGroupRef, baseName, resolution);
    } else if (format === "mp4") {
      if (!canvas) {
        console.error("Canvas not provided for video export");
        toast.error("Error: Canvas not available for video export");
        return;
      }
      success = await exportToMP4(canvas, baseName);
    } else if (format === "gif") {
      if (!canvas) {
        console.error("Canvas not provided for GIF export");
        toast.error("Error: Canvas not available for GIF export");
        return;
      }
      success = await exportToGIF(canvas, baseName);
    } else {
      const modelGroupClone = modelGroupRef.current.clone();
      modelGroupClone.updateMatrixWorld(true);

      if (format === "stl") {
        success = await exportToSTL(modelGroupClone, `${baseName}.stl`);
      } else if (format === "glb" || format === "gltf") {
        success = await exportToGLTF(
          modelGroupClone,
          `${baseName}.${format}`,
          format,
        );
      }

      cleanupExportedModel(modelGroupClone);
    }

    if (success) {
      toast.success(`${baseName}.${format} has been downloaded successfully`, {
        duration: 3000,
      });
    } else {
      toast.error(`Failed to export ${format.toUpperCase()}`);
    }
  } catch (error) {
    console.error("Export error:", error);
    toast.error(
      `Export failed: ${(error as Error).message || "Unknown error"}`,
    );
  }
}

export async function handlePrint(
  format: "stl",
  modelGroupRef: React.RefObject<THREE.Group | null>,
  fileName: string,
  printService: "m3d" | "bambu",
): Promise<void> {
  const baseName = fileName.replace(".svg", "");

  if (!modelGroupRef.current || !fileName) {
    console.error("Export failed: Model group or filename missing");
    toast.error("Error: Cannot export - model not loaded");
    return;
  }

  try {
    let success = false;

    const modelGroupClone = modelGroupRef.current.clone();

    modelGroupClone.matrixWorld.copy(modelGroupRef.current.matrixWorld);
    modelGroupClone.matrix.copy(modelGroupRef.current.matrix);
    modelGroupClone.updateMatrix();
    modelGroupClone.updateMatrixWorld(true);

    if (format === "stl") {
      const blob = await prepareSTL(modelGroupClone);
      if (blob) {
        success = true;

        if (printService === "m3d") {
          try {
            const form = new FormData();

            const fileBuffer = await blob.arrayBuffer();

            form.append("file", new Blob([fileBuffer]), `${baseName}.stl`);

            form.append("external_source", "vecto3d");

            const API_URL = "https://backend.mandarin3d.com/api/submit-remote";
            const response = await fetch(API_URL, {
              method: "POST",
              body: form,
            });

            const data = await response.json();

            if (response.ok) {
              success = true;
              window.open(data.url, "_blank");
            } else {
              throw new Error(`Server responded with ${response.status}`);
            }
          } catch (error) {
            console.error("Error sending to M3D:", error);
            toast.error("Failed to send model to M3D");
            success = false;
          }
        } else if (printService === "bambu") {
          try {
            const response = await fetch(
              "https://vaultl.ink/api/headless-upload",
              {
                method: "POST",
                body: blob,
                headers: {
                  "Content-Type": "application/octet-stream",
                  "X-File-Name": `${baseName}.stl`,
                },
              },
            );

            const data = await response.json();

            if (data.url) {
              const bambuUrl = `bambustudioopen://open?file=${encodeURIComponent(
                data.url,
              )}`;
              window.location.href = bambuUrl;
            } else {
              throw new Error("Failed to get public URL");
            }
          } catch (error) {
            console.error("Failed to process file for Bambu Studio:", error);
          }
        }
      }
    }

    cleanupExportedModel(modelGroupClone);

    if (success) {
      toast.success(
        `${baseName}.${format} has been sent to print successfully`,
        {
          duration: 3000,
        },
      );
    } else {
      toast.error(`Failed to send model to print`);
    }
  } catch (error) {
    console.error("Export error:", error);
    toast.error(
      `Export failed: ${(error as Error).message || "Unknown error"}`,
    );
  }
}
