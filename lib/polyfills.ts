if (
  typeof window === "undefined" &&
  typeof globalThis.ProgressEvent === "undefined"
) {
  class ProgressEventPolyfill {
    readonly type: string;
    readonly lengthComputable: boolean;
    readonly loaded: number;
    readonly total: number;
    target: null = null;
    currentTarget: null = null;

    constructor(type: string) {
      this.type = type;
      this.lengthComputable = false;
      this.loaded = 0;
      this.total = 0;
    }
  }

  globalThis.ProgressEvent =
    ProgressEventPolyfill as unknown as typeof ProgressEvent;
}
