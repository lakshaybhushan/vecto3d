import { useEffect, useState } from "react";
import { Environment } from "@react-three/drei";
import { EXRLoader } from "three-stdlib";
import * as THREE from "three";
import { CustomEnvironmentProps, SimpleEnvironmentProps } from "@/lib/types";
import { ENVIRONMENT_PRESETS } from "@/lib/constants";
import { memoryManager } from "@/lib/memory-manager";

const textureCache = new Map<string, THREE.Texture>();
const textureLoadPromises = new Map<string, Promise<THREE.Texture>>();

const clearTextureCache = () => {
  for (const [, texture] of textureCache.entries()) {
    memoryManager.untrack(texture);
    texture.dispose();
  }
  textureCache.clear();
  textureLoadPromises.clear();
};

const loadEnvironmentTexture = (exrFile: string) => {
  const cachedTexture = textureCache.get(exrFile);
  if (cachedTexture) return Promise.resolve(cachedTexture);

  const pendingTexture = textureLoadPromises.get(exrFile);
  if (pendingTexture) return pendingTexture;

  const loadPromise = import(`@pmndrs/assets/hdri/${exrFile}`)
    .then(async (asset) => {
      const loader = new EXRLoader();
      const texture = await loader.loadAsync(asset.default);
      texture.mapping = THREE.EquirectangularReflectionMapping;
      memoryManager.track(texture);
      textureCache.set(exrFile, texture);
      return texture;
    })
    .finally(() => {
      textureLoadPromises.delete(exrFile);
    });

  textureLoadPromises.set(exrFile, loadPromise);
  return loadPromise;
};

export function CustomEnvironment({ imageUrl }: CustomEnvironmentProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let loadedTexture: THREE.Texture | null = null;
    let isMounted = true;

    loader.load(imageUrl, (loadedTextureFromFile) => {
      loadedTextureFromFile.mapping = THREE.EquirectangularReflectionMapping;
      loadedTexture = loadedTextureFromFile;
      memoryManager.track(loadedTexture);
      if (isMounted) {
        setTexture(loadedTextureFromFile);
      }
    });

    return () => {
      isMounted = false;
      if (loadedTexture) {
        memoryManager.untrack(loadedTexture);
        loadedTexture.dispose();
      }
    };
  }, [imageUrl]);

  if (!texture) return null;

  return <Environment map={texture} background={false} />;
}

export function EXREnvironment({ exrFile }: { exrFile: string }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(
    () => textureCache.get(exrFile) || null,
  );

  useEffect(() => {
    let isMounted = true;
    loadEnvironmentTexture(exrFile)
      .then((loadedTexture) => {
        if (isMounted) setTexture(loadedTexture);
      })
      .catch((error) => {
        console.error(`Failed to load EXR: ${exrFile}`, error);
      });

    return () => {
      isMounted = false;
    };
  }, [exrFile]);

  return texture ? (
    <Environment key={exrFile} map={texture} background={false} />
  ) : null;
}

export function SimpleEnvironment({
  environmentPreset,
  customHdriUrl,
}: SimpleEnvironmentProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleBeforeUnload = () => {
        clearTextureCache();
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, []);

  if (environmentPreset === "custom" && customHdriUrl) {
    return <CustomEnvironment imageUrl={customHdriUrl} />;
  }

  if (environmentPreset !== "custom") {
    const preset = ENVIRONMENT_PRESETS.find(
      (p) => p.name === environmentPreset,
    );

    if (preset?.exrFile) {
      return (
        <EXREnvironment key={environmentPreset} exrFile={preset.exrFile} />
      );
    }
  }

  return null;
}

export { clearTextureCache };
