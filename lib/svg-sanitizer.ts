import DOMPurify from "dompurify";

export interface SanitizationConfig {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  stripScripts?: boolean;
}

const DEFAULT_SVG_CONFIG: SanitizationConfig = {
  allowedTags: [
    "svg",
    "g",
    "path",
    "circle",
    "ellipse",
    "line",
    "rect",
    "polyline",
    "polygon",
    "text",
    "tspan",
    "defs",
    "clipPath",
    "mask",
    "pattern",
    "image",
    "switch",
    "foreignObject",
    "marker",
    "symbol",
    "use",
    "style",
    "linearGradient",
    "radialGradient",
    "stop",
    "animate",
    "animateTransform",
    "animateMotion",
    "mpath",
    "filter",
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feDropShadow",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence",
  ],
  allowedAttributes: {
    "*": [
      "id",
      "class",
      "style",
      "transform",
      "fill",
      "stroke",
      "stroke-width",
      "stroke-linecap",
      "stroke-linejoin",
      "stroke-dasharray",
      "stroke-dashoffset",
      "opacity",
      "fill-opacity",
      "stroke-opacity",
      "clip-path",
      "mask",
      "filter",
    ],
    svg: [
      "width",
      "height",
      "viewBox",
      "preserveAspectRatio",
      "xmlns",
      "xmlns:xlink",
      "version",
    ],
    path: ["d"],
    circle: ["cx", "cy", "r"],
    ellipse: ["cx", "cy", "rx", "ry"],
    line: ["x1", "y1", "x2", "y2"],
    rect: ["x", "y", "width", "height", "rx", "ry"],
    polyline: ["points"],
    polygon: ["points"],
    text: [
      "x",
      "y",
      "dx",
      "dy",
      "text-anchor",
      "font-family",
      "font-size",
      "font-weight",
    ],
    tspan: ["x", "y", "dx", "dy"],
    image: ["x", "y", "width", "height", "href", "xlink:href"],
    use: ["href", "xlink:href", "x", "y", "width", "height"],
    linearGradient: [
      "x1",
      "y1",
      "x2",
      "y2",
      "gradientUnits",
      "gradientTransform",
    ],
    radialGradient: [
      "cx",
      "cy",
      "r",
      "fx",
      "fy",
      "gradientUnits",
      "gradientTransform",
    ],
    stop: ["offset", "stop-color", "stop-opacity"],
    pattern: ["x", "y", "width", "height", "patternUnits", "patternTransform"],
    clipPath: ["clipPathUnits"],
    mask: ["maskUnits", "maskContentUnits"],
  },
  stripScripts: true,
};

export function sanitizeSvg(
  svgContent: string,
  config: Partial<SanitizationConfig> = {},
): string {
  if (!svgContent || typeof svgContent !== "string") {
    return "";
  }

  const finalConfig = { ...DEFAULT_SVG_CONFIG, ...config };
  const domPurifyConfig = {
    USE_PROFILES: { svg: true, svgFilters: true },
    ALLOWED_TAGS: finalConfig.allowedTags,
    ALLOWED_ATTR: Object.keys(finalConfig.allowedAttributes || {}).reduce(
      (acc, tag) => {
        const attrs = finalConfig.allowedAttributes?.[tag] || [];
        return [...acc, ...attrs];
      },
      [] as string[],
    ),
    KEEP_CONTENT: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
  };

  try {
    const sanitized = DOMPurify.sanitize(svgContent, domPurifyConfig);

    if (!sanitized.toString().includes("<svg")) {
      console.warn("Sanitization removed SVG root element");
      return "";
    }

    return sanitized.toString();
  } catch (error) {
    console.error("SVG sanitization failed:", error);
    return "";
  }
}

export function sanitizeSvgForPreview(svgContent: string): string {
  return sanitizeSvg(svgContent, {
    stripScripts: true,
    allowedAttributes: {
      ...DEFAULT_SVG_CONFIG.allowedAttributes,
      "*": [
        ...(DEFAULT_SVG_CONFIG.allowedAttributes?.["*"] || []),
        "style",
        "fill",
        "stroke",
      ],
    },
  });
}

export function isValidSvg(content: string): boolean {
  if (!content || typeof content !== "string") {
    return false;
  }

  const svgPattern = /<svg[^>]*>[\s\S]*<\/svg>/i;
  return svgPattern.test(content.trim());
}
