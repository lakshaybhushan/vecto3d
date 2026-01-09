import * as THREE from "three";

interface CachedTexture {
  texture: THREE.Texture;
  lastUsed: number;
  size: number;
}

interface TextureOptions {
  wrapS?: THREE.Wrapping;
  wrapT?: THREE.Wrapping;
  repeat?: { x: number; y: number };
  flipY?: boolean;
  format?: THREE.PixelFormat;
  generateMipmaps?: boolean;
  colorSpace?: THREE.ColorSpace;
}

class TextureCache {
  private cache = new Map<string, CachedTexture>();
  private readonly maxCacheSize = 100 * 1024 * 1024;
  private currentCacheSize = 0;
  private loader = new THREE.TextureLoader();

  async loadTexture(
    url: string,
    options: TextureOptions = {},
  ): Promise<THREE.Texture> {
    if (typeof window === "undefined") {
      throw new Error(
        "Texture loading is only available in browser environment",
      );
    }

    const cached = this.cache.get(url);
    if (cached) {
      cached.lastUsed = Date.now();
      const clonedTexture = cached.texture.clone();
      this.applyTextureOptions(clonedTexture, options);
      return clonedTexture;
    }

    const texture = await this.loader.loadAsync(url);

    const defaultOptions: TextureOptions = {
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
      flipY: true,
      generateMipmaps: true,
      ...options,
    };

    this.applyTextureOptions(texture, defaultOptions);

    const estimatedSize = this.estimateTextureSize(texture);
    this.ensureCacheSpace(estimatedSize);

    const cachedTexture = texture.clone();
    this.cache.set(url, {
      texture: cachedTexture,
      lastUsed: Date.now(),
      size: estimatedSize,
    });

    this.currentCacheSize += estimatedSize;

    return texture;
  }

  private applyTextureOptions(
    texture: THREE.Texture,
    options: TextureOptions,
  ): void {
    if (options.wrapS !== undefined) texture.wrapS = options.wrapS;
    if (options.wrapT !== undefined) texture.wrapT = options.wrapT;
    if (options.repeat) texture.repeat.set(options.repeat.x, options.repeat.y);
    if (options.flipY !== undefined) texture.flipY = options.flipY;
    if (options.format !== undefined) texture.format = options.format;
    if (options.generateMipmaps !== undefined)
      texture.generateMipmaps = options.generateMipmaps;
    if (options.colorSpace !== undefined)
      texture.colorSpace = options.colorSpace;

    texture.needsUpdate = true;
  }

  private estimateTextureSize(texture: THREE.Texture): number {
    const image = texture.image as HTMLImageElement;
    if (image && image.width && image.height) {
      return image.width * image.height * 4 * 1.33;
    }
    return 1024 * 1024 * 4;
  }

  private ensureCacheSpace(neededSize: number): void {
    while (
      this.currentCacheSize + neededSize > this.maxCacheSize &&
      this.cache.size > 0
    ) {
      let oldestUrl = "";
      let oldestTime = Date.now();

      for (const [url, cached] of this.cache.entries()) {
        if (cached.lastUsed < oldestTime) {
          oldestTime = cached.lastUsed;
          oldestUrl = url;
        }
      }

      if (oldestUrl) {
        const removed = this.cache.get(oldestUrl);
        if (removed) {
          removed.texture.dispose();
          this.currentCacheSize -= removed.size;
          this.cache.delete(oldestUrl);
        }
      } else {
        break;
      }
    } else {
      break;
    }
  }
}

  async preloadTextures(
    urls: string[],
    options: TextureOptions = {},
  ): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }

    const promises = urls.map((url) =>
      this.loadTexture(url, options).catch(() => null),
    );

    await Promise.all(promises);
  }

  getCacheStats(): { size: string; count: number; maxSize: string } {
    return {
      size: this.formatBytes(this.currentCacheSize),
      count: this.cache.size,
      maxSize: this.formatBytes(this.maxCacheSize),
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  clearCache(): void {
    for (const cached of this.cache.values()) {
      cached.texture.dispose();
    }
    this.cache.clear();
    this.currentCacheSize = 0;
  }

  removeFromCache(url: string): boolean {
    const cached = this.cache.get(url);
    if (cached) {
      cached.texture.dispose();
      this.currentCacheSize -= cached.size;
      this.cache.delete(url);
      return true;
    }
    return false;
  }
}

export const textureCache = new TextureCache();

export async function loadTexture(
  url: string,
  options: TextureOptions = {},
): Promise<THREE.Texture> {
  return textureCache.loadTexture(url, options);
}

export async function preloadTextures(
  urls: string[],
  options: TextureOptions = {},
): Promise<void> {
  return textureCache.preloadTextures(urls, options);
}

export type { TextureOptions };
