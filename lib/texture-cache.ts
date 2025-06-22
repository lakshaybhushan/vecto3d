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
  private readonly maxCacheSize = 100 * 1024 * 1024; // 100MB cache limit
  private currentCacheSize = 0;
  private loader = new THREE.TextureLoader();

  async loadTexture(
    url: string,
    options: TextureOptions = {},
  ): Promise<THREE.Texture> {
    // Prevent SSR issues by checking if we're in a browser environment
    if (typeof window === "undefined") {
      throw new Error(
        "Texture loading is only available in browser environment",
      );
    }

    // Check if texture is already cached
    const cached = this.cache.get(url);
    if (cached) {
      cached.lastUsed = Date.now();
      const clonedTexture = cached.texture.clone();
      this.applyTextureOptions(clonedTexture, options);
      return clonedTexture;
    }

    try {
      // Load texture from Blob URL
      const texture = await this.loader.loadAsync(url);

      // Apply default options
      const defaultOptions: TextureOptions = {
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        flipY: true,
        generateMipmaps: true,
        ...options,
      };

      this.applyTextureOptions(texture, defaultOptions);

      // Estimate texture size (rough calculation)
      const estimatedSize = this.estimateTextureSize(texture);

      // Check cache limits and clean if necessary
      this.ensureCacheSpace(estimatedSize);

      // Cache the texture (clone for cache, return original)
      const cachedTexture = texture.clone();
      this.cache.set(url, {
        texture: cachedTexture,
        lastUsed: Date.now(),
        size: estimatedSize,
      });

      this.currentCacheSize += estimatedSize;

      return texture;
    } catch (error) {
      console.error(`Failed to load texture from ${url}:`, error);
      throw error;
    }
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
    // Rough estimation: width * height * 4 bytes (RGBA) + mipmaps (~33% extra)
    const image = texture.image;
    if (image && image.width && image.height) {
      return image.width * image.height * 4 * 1.33;
    }
    return 1024 * 1024 * 4; // Default fallback: 1MB
  }

  private ensureCacheSpace(neededSize: number): void {
    while (
      this.currentCacheSize + neededSize > this.maxCacheSize &&
      this.cache.size > 0
    ) {
      // Find least recently used texture
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
        break; // Safety break
      }
    }
  }

  async preloadTextures(
    urls: string[],
    options: TextureOptions = {},
  ): Promise<void> {
    // Prevent SSR issues by checking if we're in a browser environment
    if (typeof window === "undefined") {
      console.warn(
        "Texture preloading is only available in browser environment",
      );
      return;
    }

    const promises = urls.map((url) =>
      this.loadTexture(url, options).catch((error) => {
        console.warn(`Failed to preload texture ${url}:`, error);
        return null;
      }),
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

// Export singleton instance
export const textureCache = new TextureCache();

// Helper function for easy texture loading
export async function loadTexture(
  url: string,
  options: TextureOptions = {},
): Promise<THREE.Texture> {
  return textureCache.loadTexture(url, options);
}

// Helper function for preloading multiple textures
export async function preloadTextures(
  urls: string[],
  options: TextureOptions = {},
): Promise<void> {
  return textureCache.preloadTextures(urls, options);
}

export type { TextureOptions };
