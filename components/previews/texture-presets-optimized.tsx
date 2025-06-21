import { useEffect, useState } from "react";
import { TEXTURE_PRESETS } from "@/lib/constants";
import { loadTexture, preloadTextures } from "@/lib/texture-cache";
import type { TextureOptions } from "@/lib/texture-cache";

interface OptimizedTextureCache {
  diffuse?: THREE.Texture;
  normal?: THREE.Texture;
  roughness?: THREE.Texture;
  ao?: THREE.Texture;
}

const textureCache = new Map<string, OptimizedTextureCache>();
let isPreloading = false;

// Preload default textures for better initial experience
const preloadDefaultTextures = async () => {
  try {
    const oakPreset = TEXTURE_PRESETS.find((preset) => preset.name === "oak");
    if (!oakPreset) return;

    const textureOptions: TextureOptions = {
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
      generateMipmaps: true,
    };

    const textures: OptimizedTextureCache = {};

    // Load diffuse texture
    textures.diffuse = await loadTexture(oakPreset.diffuseMap, textureOptions);

    // Load other maps if available
    if (oakPreset.normalMap) {
      textures.normal = await loadTexture(oakPreset.normalMap, textureOptions);
    }

    if (oakPreset.roughnessMap) {
      textures.roughness = await loadTexture(
        oakPreset.roughnessMap,
        textureOptions,
      );
    }

    if (oakPreset.aoMap) {
      textures.ao = await loadTexture(oakPreset.aoMap, textureOptions);
    }

    textureCache.set("oak", textures);
  } catch (error) {
    console.error("Failed to preload default textures:", error);
  }
};

// Preload all texture URLs for faster switching
const preloadAllTextures = async () => {
  if (isPreloading) return;
  isPreloading = true;

  try {
    // Collect all texture URLs
    const allUrls: string[] = [];
    for (const preset of TEXTURE_PRESETS) {
      allUrls.push(preset.diffuseMap);
      if (preset.normalMap) allUrls.push(preset.normalMap);
      if (preset.roughnessMap) allUrls.push(preset.roughnessMap);
      if (preset.aoMap) allUrls.push(preset.aoMap);
    }

    // Preload all textures in batches to avoid overwhelming the network
    const batchSize = 5;
    for (let i = 0; i < allUrls.length; i += batchSize) {
      const batch = allUrls.slice(i, i + batchSize);
      await preloadTextures(batch, {
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        generateMipmaps: true,
      });

      // Small delay between batches to prevent browser throttling
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Cache textures by preset name for quick access
    for (const preset of TEXTURE_PRESETS) {
      try {
        const textures: OptimizedTextureCache = {};

        textures.diffuse = await loadTexture(preset.diffuseMap);
        if (preset.normalMap) {
          textures.normal = await loadTexture(preset.normalMap);
        }
        if (preset.roughnessMap) {
          textures.roughness = await loadTexture(preset.roughnessMap);
        }
        if (preset.aoMap) {
          textures.ao = await loadTexture(preset.aoMap);
        }

        textureCache.set(preset.name, textures);
      } catch (error) {
        console.warn(`Failed to cache texture preset: ${preset.name}`, error);
      }
    }
  } catch (error) {
    console.error("Failed to preload textures:", error);
  } finally {
    isPreloading = false;
  }
};

export interface OptimizedTextureProviderProps {
  texturePreset: string;
  children: (textures: OptimizedTextureCache | null) => React.ReactNode;
}

export function OptimizedTextureProvider({
  texturePreset,
  children,
}: OptimizedTextureProviderProps) {
  const [textures, setTextures] = useState<OptimizedTextureCache | null>(
    () => textureCache.get(texturePreset) || null,
  );

  useEffect(() => {
    // Start preloading all textures in the background
    preloadAllTextures();

    // Check if textures are already cached
    if (textureCache.has(texturePreset)) {
      const cachedTextures = textureCache.get(texturePreset)!;
      if (textures !== cachedTextures) {
        setTextures(cachedTextures);
      }
      return;
    }

    let isMounted = true;
    const loadTexturesForPreset = async () => {
      try {
        const preset = TEXTURE_PRESETS.find((p) => p.name === texturePreset);
        if (!preset || !isMounted) return;

        const loadedTextures: OptimizedTextureCache = {};
        const textureOptions: TextureOptions = {
          wrapS: THREE.RepeatWrapping,
          wrapT: THREE.RepeatWrapping,
          generateMipmaps: true,
        };

        // Load textures using the optimized cache
        loadedTextures.diffuse = await loadTexture(
          preset.diffuseMap,
          textureOptions,
        );

        if (preset.normalMap && isMounted) {
          loadedTextures.normal = await loadTexture(
            preset.normalMap,
            textureOptions,
          );
        }

        if (preset.roughnessMap && isMounted) {
          loadedTextures.roughness = await loadTexture(
            preset.roughnessMap,
            textureOptions,
          );
        }

        if (preset.aoMap && isMounted) {
          loadedTextures.ao = await loadTexture(preset.aoMap, textureOptions);
        }

        if (!isMounted) return;

        textureCache.set(texturePreset, loadedTextures);
        setTextures(loadedTextures);
      } catch (error) {
        console.error(`Failed to load textures for: ${texturePreset}`, error);
        if (isMounted) {
          setTextures(null);
        }
      }
    };

    loadTexturesForPreset();

    return () => {
      isMounted = false;
    };
  }, [texturePreset, textures]);

  return <>{children(textures)}</>;
}

export function FastOptimizedTextureLoader({
  texturePreset,
  onTexturesLoaded,
}: {
  texturePreset: string;
  onTexturesLoaded: (textures: OptimizedTextureCache | null) => void;
}) {
  const preset = TEXTURE_PRESETS.find((p) => p.name === texturePreset);

  useEffect(() => {
    if (!preset) {
      onTexturesLoaded(null);
      return;
    }

    // Check if textures are already cached
    const cachedTextures = textureCache.get(texturePreset);
    if (cachedTextures) {
      onTexturesLoaded(cachedTextures);
      return;
    }

    let isMounted = true;
    const loadTextures = async () => {
      try {
        const loadedTextures: OptimizedTextureCache = {};
        const textureOptions: TextureOptions = {
          wrapS: THREE.RepeatWrapping,
          wrapT: THREE.RepeatWrapping,
          generateMipmaps: true,
        };

        // Load all textures in parallel for fastest loading
        const promises: Promise<void>[] = [
          loadTexture(preset.diffuseMap, textureOptions).then((tex) => {
            if (isMounted) loadedTextures.diffuse = tex;
          }),
        ];

        if (preset.normalMap) {
          promises.push(
            loadTexture(preset.normalMap, textureOptions).then((tex) => {
              if (isMounted) loadedTextures.normal = tex;
            }),
          );
        }

        if (preset.roughnessMap) {
          promises.push(
            loadTexture(preset.roughnessMap, textureOptions).then((tex) => {
              if (isMounted) loadedTextures.roughness = tex;
            }),
          );
        }

        if (preset.aoMap) {
          promises.push(
            loadTexture(preset.aoMap, textureOptions).then((tex) => {
              if (isMounted) loadedTextures.ao = tex;
            }),
          );
        }

        await Promise.all(promises);

        if (!isMounted) return;

        textureCache.set(texturePreset, loadedTextures);
        onTexturesLoaded(loadedTextures);
      } catch (error) {
        console.error(`Failed to load textures for: ${texturePreset}`, error);
        if (isMounted) {
          onTexturesLoaded(null);
        }
      }
    };

    loadTextures();

    return () => {
      isMounted = false;
    };
  }, [texturePreset, preset, onTexturesLoaded]);

  return null;
}

// Initialize default texture preloading
if (typeof window !== "undefined") {
  // Run preloading after a short delay to not block initial render
  setTimeout(preloadDefaultTextures, 1000);
}
