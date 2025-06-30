import * as THREE from "three";
import { clearTextureCache } from "@/components/previews/environment-presets";
import { textureCache } from "@/lib/texture-cache";

class MemoryManager {
  private static instance: MemoryManager;
  private resources: Set<
    THREE.Object3D | THREE.Material | THREE.Texture | THREE.BufferGeometry
  > = new Set();
  private isCleanupScheduled = false;

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  track<
    T extends
      | THREE.Object3D
      | THREE.Material
      | THREE.Texture
      | THREE.BufferGeometry,
  >(resource: T): T {
    this.resources.add(resource);
    return resource;
  }

  untrack(
    resource:
      | THREE.Object3D
      | THREE.Material
      | THREE.Texture
      | THREE.BufferGeometry,
  ): void {
    this.resources.delete(resource);
  }

  disposeResource(
    resource:
      | THREE.Object3D
      | THREE.Material
      | THREE.Texture
      | THREE.BufferGeometry,
  ): void {
    if (resource instanceof THREE.Object3D) {
      resource.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    } else if (
      resource instanceof THREE.Material ||
      resource instanceof THREE.Texture ||
      resource instanceof THREE.BufferGeometry
    ) {
      resource.dispose();
    }
    this.untrack(resource);
  }

  cleanup(): void {
    console.log(`🧹 Cleaning up ${this.resources.size} tracked resources...`);

    const resourcesToDispose = Array.from(this.resources);
    this.resources.clear();

    resourcesToDispose.forEach((resource) => {
      try {
        this.disposeResource(resource);
      } catch (error) {
        console.warn("Error disposing resource:", error);
      }
    });

    try {
      clearTextureCache();
      textureCache.clearCache();
    } catch (error) {
      console.warn("Error clearing texture caches:", error);
    }

    if (
      typeof window !== "undefined" &&
      "gc" in window &&
      typeof (window as unknown as { gc?: () => void }).gc === "function"
    ) {
      (window as unknown as { gc: () => void }).gc();
    }
  }

  scheduleCleanup(): void {
    if (this.isCleanupScheduled) return;

    this.isCleanupScheduled = true;

    setTimeout(() => {
      this.cleanup();
      this.isCleanupScheduled = false;
    }, 100);
  }

  getStats(): { trackedResources: number; memoryUsage?: number } {
    const stats = {
      trackedResources: this.resources.size,
      memoryUsage: undefined as number | undefined,
    };

    if (
      typeof window !== "undefined" &&
      (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory
    ) {
      const perfMemory = (
        performance as unknown as { memory: { usedJSHeapSize: number } }
      ).memory;
      stats.memoryUsage = perfMemory.usedJSHeapSize / 1024 / 1024;
    }

    return stats;
  }

  handleLowMemory(): void {
    console.warn("⚠️ Low memory detected, initiating aggressive cleanup...");
    this.cleanup();

    if (typeof window !== "undefined") {
      const canvases = document.querySelectorAll("canvas");
      canvases.forEach((canvas) => {
        const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
        if (!gl) return;

        const loseExt = gl.getExtension("WEBGL_lose_context");
        if (loseExt) {
          // Aggressively free GPU memory, then attempt to restore shortly after (Mindful Chase best-practice)
          loseExt.loseContext();

          // Try to restore context after a short delay so the app can continue running without manual refresh
          setTimeout(() => {
            try {
              loseExt.restoreContext();
            } catch (err) {
              console.warn("Failed to restore WebGL context", err);
            }
          }, 1000);
        }
      });
    }
  }
}

export const memoryManager = MemoryManager.getInstance();

// Only attach browser-specific event listeners when in browser environment
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    memoryManager.cleanup();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      memoryManager.scheduleCleanup();
    }
  });

  // Only monitor memory usage if performance.memory is available
  if (
    typeof performance !== "undefined" &&
    "memory" in performance &&
    (
      performance as unknown as {
        memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number };
      }
    ).memory
  ) {
    setInterval(() => {
      const memory = (
        performance as unknown as {
          memory: { usedJSHeapSize: number; jsHeapSizeLimit: number };
        }
      ).memory;
      const usedMemory = memory.usedJSHeapSize;
      const memoryLimit = memory.jsHeapSizeLimit;

      if (usedMemory / memoryLimit > 0.8) {
        memoryManager.handleLowMemory();
      }
    }, 10000);
  }
}

export default memoryManager;
