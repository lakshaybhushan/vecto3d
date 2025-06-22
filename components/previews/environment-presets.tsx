import { useEffect, useState } from "react";
import { Environment } from "@react-three/drei";
import { EXRLoader } from "three-stdlib";
import * as THREE from "three";
import { CustomEnvironmentProps, SimpleEnvironmentProps } from "@/lib/types";
import { ENVIRONMENT_PRESETS } from "@/lib/constants";
import { memoryManager } from "@/lib/memory-manager";

const textureCache = new Map<string, THREE.Texture>();
let isPreloading = false;

const clearTextureCache = () => {
  for (const [key, texture] of textureCache.entries()) {
    memoryManager.untrack(texture);
    texture.dispose();
  }
  textureCache.clear();
};

const preloadDefaultEnvironment = async () => {
  try {
    const apartment = await import("@pmndrs/assets/hdri/apartment.exr.js");
    const loader = new EXRLoader();

    loader.load(apartment.default, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      memoryManager.track(texture);
      textureCache.set("apartment.exr.js", texture);
    });
  } catch (error) {
    console.error("Failed to preload default environment:", error);
  }
};

preloadDefaultEnvironment();

const preloadEXRTextures = async () => {
  if (isPreloading) return;
  isPreloading = true;

  const loader = new EXRLoader();

  for (const preset of ENVIRONMENT_PRESETS) {
    if (preset.exrFile && !textureCache.has(preset.exrFile)) {
      try {
        const asset = await import(`@pmndrs/assets/hdri/${preset.exrFile}`);

        loader.load(asset.default, (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          memoryManager.track(texture);
          textureCache.set(preset.exrFile!, texture);
        });
      } catch (error) {
        console.error(`Failed to preload EXR: ${preset.exrFile}`, error);
      }
    }
  }
};

export function CustomEnvironment({ imageUrl }: CustomEnvironmentProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let loadedTexture: THREE.Texture | null = null;

    loader.load(imageUrl, (loadedTextureFromFile) => {
      loadedTextureFromFile.mapping = THREE.EquirectangularReflectionMapping;
      loadedTexture = loadedTextureFromFile;
      memoryManager.track(loadedTexture);
      setTexture(loadedTextureFromFile);
    });

    return () => {
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
    preloadEXRTextures();

    if (textureCache.has(exrFile)) {
      const cachedTexture = textureCache.get(exrFile)!;
      if (texture !== cachedTexture) {
        setTexture(cachedTexture);
      }
      return;
    }

    let isMounted = true;
    const loadEXR = async () => {
      try {
        const asset = await import(`@pmndrs/assets/hdri/${exrFile}`);
        if (!isMounted) return;

        const loader = new EXRLoader();
        loader.load(asset.default, (loadedTextureFromFile) => {
          if (!isMounted) return;
          loadedTextureFromFile.mapping =
            THREE.EquirectangularReflectionMapping;
          memoryManager.track(loadedTextureFromFile);
          textureCache.set(exrFile, loadedTextureFromFile);
          setTexture(loadedTextureFromFile);
        });
      } catch (error) {
        console.error(`Failed to load EXR: ${exrFile}`, error);
      }
    };

    loadEXR();

    return () => {
      isMounted = false;
    };
  }, [exrFile, texture]);

  return texture ? (
    <Environment key={exrFile} map={texture} background={false} />
  ) : null;
}

export function SimpleEnvironment({
  environmentPreset,
  customHdriUrl,
}: SimpleEnvironmentProps) {
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        const handleBeforeUnload = () => {
          clearTextureCache();
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
          window.removeEventListener("beforeunload", handleBeforeUnload);
        };
      }
    };
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
