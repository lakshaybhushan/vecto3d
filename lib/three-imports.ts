const moduleCache = new Map();

interface ThreeModules {
  STLExporter: any;
  GLTFExporter: any;
  EffectComposer: React.ComponentType<any>;
  Bloom: React.ComponentType<any>;
  SMAA: React.ComponentType<any>;
  BrightnessContrast: React.ComponentType<any>;
  ToneMapping: React.ComponentType<any>;
  OrbitControls: React.ComponentType<any>;
  BlendFunction: any;
  [key: string]: any;
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
  loader: new () => any
): Promise<T> => {
  if (assetCache.has(url)) {
    return assetCache.get(url) as T;
  }

  return new Promise<T>((resolve, reject) => {
    const newLoader = new loader();
    newLoader.load(
      url,
      (asset: T) => {
        assetCache.set(url, asset);
        resolve(asset);
      },
      undefined,
      (error: any) => reject(error)
    );
  });
};

// Clear cache when needed (e.g., low memory situations)
export const clearAssetCache = (): void => {
  assetCache.clear();
};
