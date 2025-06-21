import { useEffect, useState } from "react";
import * as THREE from "three";
import { TEXTURE_PRESETS } from "@/lib/constants";
import { preloadTextures, textureCache } from "@/lib/texture-cache";

interface PreloadStats {
  isLoading: boolean;
  loadedCount: number;
  totalCount: number;
  progress: number;
  cacheStats: { size: string; count: number; maxSize: string };
}

export function useTexturePreloader(shouldPreload: boolean = true) {
  const [stats, setStats] = useState<PreloadStats>({
    isLoading: false,
    loadedCount: 0,
    totalCount: 0,
    progress: 0,
    cacheStats: textureCache.getCacheStats(),
  });

  useEffect(() => {
    if (!shouldPreload) return;

    let isMounted = true;

    const preloadAllTextures = async () => {
      // Collect all unique texture URLs
      const allUrls = new Set<string>();

      TEXTURE_PRESETS.forEach((preset) => {
        allUrls.add(preset.diffuseMap);
        if (preset.normalMap) allUrls.add(preset.normalMap);
        if (preset.roughnessMap) allUrls.add(preset.roughnessMap);
        if (preset.aoMap) allUrls.add(preset.aoMap);
        if (preset.previewImage) allUrls.add(preset.previewImage);
      });

      const urlArray = Array.from(allUrls);
      const totalCount = urlArray.length;

      if (!isMounted) return;

      setStats((prev) => ({
        ...prev,
        isLoading: true,
        totalCount,
        loadedCount: 0,
        progress: 0,
      }));

      console.log(
        `🚀 Preloading ${totalCount} textures for bandwidth optimization...`,
      );

      // Load textures in batches to avoid overwhelming the browser
      const batchSize = 4; // Smaller batches for more responsive updates
      let loadedCount = 0;

      for (let i = 0; i < urlArray.length; i += batchSize) {
        if (!isMounted) break;

        const batch = urlArray.slice(i, i + batchSize);

        try {
          await preloadTextures(batch, {
            wrapS: THREE.RepeatWrapping,
            wrapT: THREE.RepeatWrapping,
            generateMipmaps: true,
          });

          loadedCount += batch.length;

          if (isMounted) {
            const progress = Math.round((loadedCount / totalCount) * 100);
            setStats((prev) => ({
              ...prev,
              loadedCount,
              progress,
              cacheStats: textureCache.getCacheStats(),
            }));
          }

          // Small delay between batches to keep UI responsive
          await new Promise((resolve) => setTimeout(resolve, 50));
        } catch (error) {
          console.warn(
            `Failed to preload batch starting at index ${i}:`,
            error,
          );
        }
      }

      if (isMounted) {
        setStats((prev) => ({
          ...prev,
          isLoading: false,
          cacheStats: textureCache.getCacheStats(),
        }));

        console.log("✅ Texture preloading completed!");
        console.log("📊 Cache stats:", textureCache.getCacheStats());
      }
    };

    // Start preloading after a short delay to not block initial render
    const timeoutId = setTimeout(preloadAllTextures, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [shouldPreload]);

  return stats;
}
