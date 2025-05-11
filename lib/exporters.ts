import * as THREE from "three";
import React from "react";
import { toast } from "sonner";
import { loadThreeModules } from "./three-imports";

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
              mesh.renderOrder > 0 ||
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
            mesh.renderOrder > 0 ||
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
          mesh.renderOrder > 0 ||
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

        // Handle array materials
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => {
            // If we stored original properties in userData, apply them now
            if (material.userData?.originalProperties) {
              const physMaterial = material as THREE.MeshPhysicalMaterial;
              const props = material.userData.originalProperties;

              // Apply all stored properties
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
        }
        // Handle single material
        else if (mesh.material && mesh.material.userData?.originalProperties) {
          const physMaterial = mesh.material as THREE.MeshPhysicalMaterial;
          const props = mesh.material.userData.originalProperties;

          // Apply all stored properties
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
      //Ensuring multiple materials are processed as individual materials to preserve colors
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
    exportCanvas.remove();
    URL.revokeObjectURL(dataURL);
    return true;
  } catch (error) {
    console.error("Error exporting PNG:", error);
    toast.error("Failed to generate image");
    return false;
  }
}

export async function handleExport(
  format: "stl" | "gltf" | "glb" | "png",
  modelGroupRef: React.RefObject<THREE.Group | null>,
  fileName: string,
  resolution: number = 1,
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
  // resolution: number = 1,
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

            // Convert blob to array buffer
            const fileBuffer = await blob.arrayBuffer();

            // Append the file with the correct field name that the server expects
            form.append("file", new Blob([fileBuffer]), `${baseName}.stl`);

            form.append("external_source", "vecto3d");

            const API_URL = "https://backend.mandarin3d.com/api/submit-remote";
            const response = await fetch(API_URL, {
              method: "POST",
              body: form,
            });

            const data = await response.json();
            console.log(data);

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
            // Upload to vaultl.ink to get a public URL
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

            console.log(data);

            if (data.url) {
              const bambuUrl = `bambustudioopen://open?file=${encodeURIComponent(
                data.url,
              )}`;
              console.log(bambuUrl);
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
