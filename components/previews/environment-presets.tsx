import { useEffect, useState } from "react";
import { Environment } from "@react-three/drei";
import { EXRLoader } from "three-stdlib";
import * as THREE from "three";
import { CustomEnvironmentProps, SimpleEnvironmentProps } from "@/lib/types";
import { ENVIRONMENT_PRESETS } from "@/lib/constants";

const textureCache = new Map<string, THREE.Texture>();
let isPreloading = false;

const preloadDefaultEnvironment = async () => {
  try {
    const apartment = await import("@pmndrs/assets/hdri/apartment.exr.js");
    const loader = new EXRLoader();

    loader.load(apartment.default, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
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
    loader.load(imageUrl, (loadedTexture) => {
      loadedTexture.mapping = THREE.EquirectangularReflectionMapping;
      setTexture(loadedTexture);
    });
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
