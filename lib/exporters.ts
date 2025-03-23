import * as THREE from "three";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { toast } from "sonner";

export function prepareModelForExport(model: THREE.Object3D): THREE.Object3D {
  const clonedModel = model.clone();
  clonedModel.position.set(0, 0, 0);
  clonedModel.rotation.set(0, 0, 0);
  clonedModel.scale.set(1, 1, 1);
  clonedModel.updateMatrixWorld(true);

  const cleanMaterials = new Map<string, THREE.Material>();

  clonedModel.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      const mesh = object as THREE.Mesh;

      const material = mesh.material as THREE.Material;

      const isHole = Boolean(
        material.userData?.isHole ||
          mesh.userData?.isHole ||
          mesh.renderOrder > 0 ||
          (material as THREE.MeshPhysicalMaterial)?.polygonOffsetFactor < 0,
      );

      const materialKey = isHole ? "hole" : material.uuid;

      if (!cleanMaterials.has(materialKey)) {
        const cleanMaterial = new THREE.MeshStandardMaterial({
          color: isHole
            ? 0x000000
            : (material as THREE.MeshPhysicalMaterial).color,
          roughness: (material as THREE.MeshPhysicalMaterial).roughness || 0.3,
          metalness: (material as THREE.MeshPhysicalMaterial).metalness || 0.5,
          side: THREE.FrontSide,

          transparent: isHole,
          opacity: isHole ? 0.5 : 1,
          depthWrite: !isHole,
          polygonOffset: true,
          polygonOffsetFactor: isHole ? -2 : 1,
          polygonOffsetUnits: 1,
        });

        cleanMaterial.userData.isHole = isHole;
        cleanMaterials.set(materialKey, cleanMaterial);
      }

      mesh.material = cleanMaterials.get(materialKey)!;

      mesh.userData.isHole = isHole;

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
    const exportModel = prepareModelForExport(model);

    const exporter = new STLExporter();
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

export async function exportToGLTF(
  model: THREE.Object3D,
  fileName: string,
  format: "gltf" | "glb" = "glb",
): Promise<boolean> {
  try {
    const exportModel = prepareModelForExport(model);

    const exporter = new GLTFExporter();
    const options = {
      binary: format === "glb",
      trs: true,
      onlyVisible: true,
    };

    const gltfData = await new Promise<ArrayBuffer | object>((resolve) => {
      exporter.parse(
        exportModel,
        (result) => resolve(result),
        (error) => {
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

    const renderer = (document.querySelector("canvas") as any)?.__r3f?.fiber
      ?.renderer;

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
      modelGroupClone.rotation.y = 0;
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
