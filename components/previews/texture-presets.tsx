import { useEffect, useState } from "react";
import * as THREE from "three";
import { TEXTURE_PRESETS } from "@/lib/constants";

const textureCache = new Map<
  string,
  {
    diffuse?: THREE.Texture;
    normal?: THREE.Texture;
    roughness?: THREE.Texture;
    ao?: THREE.Texture;
  }
>();

let isPreloading = false;

const preloadDefaultTextures = async () => {
  try {
    const loader = new THREE.TextureLoader();
    const oakPreset = TEXTURE_PRESETS.find((preset) => preset.name === "oak");

    if (oakPreset) {
      const textures: {
        diffuse?: THREE.Texture;
        normal?: THREE.Texture;
        roughness?: THREE.Texture;
        ao?: THREE.Texture;
      } = {};

      const promises = [
        loader.loadAsync(oakPreset.diffuseMap).then((tex) => {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          textures.diffuse = tex;
        }),
      ];

      if (oakPreset.normalMap) {
        promises.push(
          loader.loadAsync(oakPreset.normalMap).then((tex) => {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            textures.normal = tex;
          }),
        );
      }

      if (oakPreset.roughnessMap) {
        promises.push(
          loader.loadAsync(oakPreset.roughnessMap).then((tex) => {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            textures.roughness = tex;
          }),
        );
      }

      if (oakPreset.aoMap) {
        promises.push(
          loader.loadAsync(oakPreset.aoMap).then((tex) => {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            textures.ao = tex;
          }),
        );
      }

      await Promise.all(promises);
      textureCache.set("oak", textures);
    }
  } catch (error) {
    console.error("Failed to preload default textures:", error);
  }
};

preloadDefaultTextures();

const preloadAllTextures = async () => {
  if (isPreloading) return;
  isPreloading = true;

  const loader = new THREE.TextureLoader();

  for (const preset of TEXTURE_PRESETS) {
    if (!textureCache.has(preset.name)) {
      try {
        const textures: {
          diffuse?: THREE.Texture;
          normal?: THREE.Texture;
          roughness?: THREE.Texture;
          ao?: THREE.Texture;
        } = {};

        const promises = [
          loader.loadAsync(preset.diffuseMap).then((tex) => {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            textures.diffuse = tex;
          }),
        ];

        if (preset.normalMap) {
          promises.push(
            loader.loadAsync(preset.normalMap).then((tex) => {
              tex.wrapS = THREE.RepeatWrapping;
              tex.wrapT = THREE.RepeatWrapping;
              textures.normal = tex;
            }),
          );
        }

        if (preset.roughnessMap) {
          promises.push(
            loader.loadAsync(preset.roughnessMap).then((tex) => {
              tex.wrapS = THREE.RepeatWrapping;
              tex.wrapT = THREE.RepeatWrapping;
              textures.roughness = tex;
            }),
          );
        }

        if (preset.aoMap) {
          promises.push(
            loader.loadAsync(preset.aoMap).then((tex) => {
              tex.wrapS = THREE.RepeatWrapping;
              tex.wrapT = THREE.RepeatWrapping;
              textures.ao = tex;
            }),
          );
        }

        await Promise.all(promises);
        textureCache.set(preset.name, textures);
      } catch (error) {
        console.error(`Failed to preload texture: ${preset.name}`, error);
      }
    }
  }
};

export interface TextureProviderProps {
  texturePreset: string;
  children: (
    textures: {
      diffuse?: THREE.Texture;
      normal?: THREE.Texture;
      roughness?: THREE.Texture;
      ao?: THREE.Texture;
    } | null,
  ) => React.ReactNode;
}

export function TextureProvider({
  texturePreset,
  children,
}: TextureProviderProps) {
  const [textures, setTextures] = useState<{
    diffuse?: THREE.Texture;
    normal?: THREE.Texture;
    roughness?: THREE.Texture;
    ao?: THREE.Texture;
  } | null>(() => textureCache.get(texturePreset) || null);

  useEffect(() => {
    preloadAllTextures();

    if (textureCache.has(texturePreset)) {
      const cachedTextures = textureCache.get(texturePreset)!;
      if (textures !== cachedTextures) {
        setTextures(cachedTextures);
      }
      return;
    }

    let isMounted = true;
    const loadTextures = async () => {
      try {
        const preset = TEXTURE_PRESETS.find((p) => p.name === texturePreset);
        if (!preset || !isMounted) return;

        const loader = new THREE.TextureLoader();
        const loadedTextures: {
          diffuse?: THREE.Texture;
          normal?: THREE.Texture;
          roughness?: THREE.Texture;
          ao?: THREE.Texture;
        } = {};

        const promises = [
          loader.loadAsync(preset.diffuseMap).then((tex) => {
            if (!isMounted) return;
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            loadedTextures.diffuse = tex;
          }),
        ];

        if (preset.normalMap) {
          promises.push(
            loader.loadAsync(preset.normalMap).then((tex) => {
              if (!isMounted) return;
              tex.wrapS = THREE.RepeatWrapping;
              tex.wrapT = THREE.RepeatWrapping;
              loadedTextures.normal = tex;
            }),
          );
        }

        if (preset.roughnessMap) {
          promises.push(
            loader.loadAsync(preset.roughnessMap).then((tex) => {
              if (!isMounted) return;
              tex.wrapS = THREE.RepeatWrapping;
              tex.wrapT = THREE.RepeatWrapping;
              loadedTextures.roughness = tex;
            }),
          );
        }

        if (preset.aoMap) {
          promises.push(
            loader.loadAsync(preset.aoMap).then((tex) => {
              if (!isMounted) return;
              tex.wrapS = THREE.RepeatWrapping;
              tex.wrapT = THREE.RepeatWrapping;
              loadedTextures.ao = tex;
            }),
          );
        }

        await Promise.all(promises);

        if (!isMounted) return;
        textureCache.set(texturePreset, loadedTextures);
        setTextures(loadedTextures);
      } catch (error) {
        console.error(`Failed to load textures for: ${texturePreset}`, error);
      }
    };

    loadTextures();

    return () => {
      isMounted = false;
    };
  }, [texturePreset, textures]);

  return <>{children(textures)}</>;
}

export function FastTextureLoader({
  texturePreset,
  onTexturesLoaded,
}: {
  texturePreset: string;
  onTexturesLoaded: (
    textures: {
      diffuse?: THREE.Texture;
      normal?: THREE.Texture;
      roughness?: THREE.Texture;
      ao?: THREE.Texture;
    } | null,
  ) => void;
}) {
  const preset = TEXTURE_PRESETS.find((p) => p.name === texturePreset);

  useEffect(() => {
    if (!preset) {
      onTexturesLoaded(null);
      return;
    }

    const cachedTextures = textureCache.get(texturePreset);

    if (cachedTextures) {
      // Provide cached textures directly without configuration
      onTexturesLoaded(cachedTextures);
      return;
    }

    let isMounted = true;
    const loadTextures = async () => {
      try {
        const loader = new THREE.TextureLoader();
        const loadedTextures: {
          diffuse?: THREE.Texture;
          normal?: THREE.Texture;
          roughness?: THREE.Texture;
          ao?: THREE.Texture;
        } = {};

        const promises = [
          loader.loadAsync(preset.diffuseMap).then((tex) => {
            if (!isMounted) return;
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            loadedTextures.diffuse = tex;
          }),
        ];

        if (preset.normalMap) {
          promises.push(
            loader.loadAsync(preset.normalMap).then((tex) => {
              if (!isMounted) return;
              tex.wrapS = THREE.RepeatWrapping;
              tex.wrapT = THREE.RepeatWrapping;
              loadedTextures.normal = tex;
            }),
          );
        }

        if (preset.roughnessMap) {
          promises.push(
            loader.loadAsync(preset.roughnessMap).then((tex) => {
              if (!isMounted) return;
              tex.wrapS = THREE.RepeatWrapping;
              tex.wrapT = THREE.RepeatWrapping;
              loadedTextures.roughness = tex;
            }),
          );
        }

        if (preset.aoMap) {
          promises.push(
            loader.loadAsync(preset.aoMap).then((tex) => {
              if (!isMounted) return;
              tex.wrapS = THREE.RepeatWrapping;
              tex.wrapT = THREE.RepeatWrapping;
              loadedTextures.ao = tex;
            }),
          );
        }

        await Promise.all(promises);

        if (!isMounted) return;

        textureCache.set(texturePreset, loadedTextures);
        onTexturesLoaded(loadedTextures);
      } catch (error) {
        console.error(`Failed to load textures for: ${texturePreset}`, error);
        onTexturesLoaded(null);
      }
    };

    loadTextures();

    return () => {
      isMounted = false;
    };
  }, [texturePreset, preset, onTexturesLoaded]);

  return null;
}
