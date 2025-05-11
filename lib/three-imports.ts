import * as THREE from "three";

const moduleCache = new Map();

interface ThreeModules {
  STLExporter: {
    new (): {
      parse: (
        object: THREE.Object3D,
        options: { binary: boolean },
      ) => ArrayBuffer;
    };
  };
  GLTFExporter: {
    new (): {
      parse: (
        object: THREE.Object3D,
        onDone: (result: ArrayBuffer | object) => void,
        onError: (error: Error) => void,
        options: {
          binary: boolean;
          trs: boolean;
          onlyVisible: boolean;
          embedImages: boolean;
          includeCustomExtensions: boolean;
          animations: unknown[];
          forceIndices: boolean;
          processPendingMaterials: (
            materials: Map<THREE.Material, THREE.Material>,
          ) => Map<THREE.Material, THREE.Material>;
        },
      ) => void;
    };
  };
  EffectComposer: React.ComponentType<{
    children?: React.ReactNode;
    enabled?: boolean;
    [key: string]: unknown;
  }>;
  Bloom: React.ComponentType<{
    intensity?: number;
    luminanceThreshold?: number;
    luminanceSmoothing?: number;
    mipmapBlur?: boolean;
    [key: string]: unknown;
  }>;
  SMAA: React.ComponentType<{
    enabled?: boolean;
    [key: string]: unknown;
  }>;
  BrightnessContrast: React.ComponentType<{
    brightness?: number;
    contrast?: number;
    [key: string]: unknown;
  }>;
  ToneMapping: React.ComponentType<{
    mode?: number;
    [key: string]: unknown;
  }>;
  OrbitControls: React.ComponentType<{
    enableDamping?: boolean;
    dampingFactor?: number;
    [key: string]: unknown;
  }>;
  BlendFunction: {
    SKIP: number;
    SET: number;
    ADD: number;
    ALPHA: number;
    AVERAGE: number;
    COLOR: number;
    COLOR_BURN: number;
    COLOR_DODGE: number;
    DARKEN: number;
    DIFFERENCE: number;
    DIVIDE: number;
    DST: number;
    EXCLUSION: number;
    HARD_LIGHT: number;
    HARD_MIX: number;
    HUE: number;
    INVERT: number;
    INVERT_RGB: number;
    LIGHTEN: number;
    LINEAR_BURN: number;
    LINEAR_DODGE: number;
    LINEAR_LIGHT: number;
    LUMINOSITY: number;
    MULTIPLY: number;
    NEGATION: number;
    NORMAL: number;
    OVERLAY: number;
    PIN_LIGHT: number;
    SATURATION: number;
    SCREEN: number;
    SOFT_LIGHT: number;
    SRC: number;
    SUBTRACT: number;
    VIVID_LIGHT: number;
  };
}

export const loadThreeModules = async (): Promise<ThreeModules> => {
  try {
    // Check cache first
    if (moduleCache.size > 0) {
      return Object.fromEntries(moduleCache) as unknown as ThreeModules;
    }

    const [
      { STLExporter },
      { GLTFExporter },
      { EffectComposer },
      { Bloom, SMAA, BrightnessContrast, ToneMapping },
      { OrbitControls },
      { BlendFunction },
    ] = await Promise.all([
      import("three/examples/jsm/exporters/STLExporter.js"),
      import("three/examples/jsm/exporters/GLTFExporter.js"),
      import("@react-three/postprocessing"),
      import("@react-three/postprocessing"),
      import("@react-three/drei"),
      import("postprocessing"),
    ]);

    // Store in cache
    moduleCache.set("STLExporter", STLExporter);
    moduleCache.set("GLTFExporter", GLTFExporter);
    moduleCache.set("EffectComposer", EffectComposer);
    moduleCache.set("Bloom", Bloom);
    moduleCache.set("SMAA", SMAA);
    moduleCache.set("BrightnessContrast", BrightnessContrast);
    moduleCache.set("ToneMapping", ToneMapping);
    moduleCache.set("OrbitControls", OrbitControls);
    moduleCache.set("BlendFunction", BlendFunction);

    return Object.fromEntries(moduleCache) as unknown as ThreeModules;
  } catch (error) {
    console.error("Failed to load Three.js modules:", error);
    throw error;
  }
};

// Asset caching system
const assetCache = new Map();

export const loadModelAsset = async <T>(
  url: string,
  loader: new () => THREE.Loader,
): Promise<T> => {
  if (assetCache.has(url)) {
    return assetCache.get(url) as T;
  }

  return new Promise<T>((resolve, reject) => {
    const newLoader = new loader();
    newLoader.load(
      url,
      (data: unknown) => {
        const asset = data as T;
        assetCache.set(url, asset);
        resolve(asset);
      },
      undefined,
      (error: unknown) =>
        reject(error instanceof Error ? error : new Error(String(error))),
    );
  });
};

// Clear cache when needed (e.g., low memory situations)
export const clearAssetCache = (): void => {
  assetCache.clear();
};
