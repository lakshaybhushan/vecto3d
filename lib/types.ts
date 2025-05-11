import * as THREE from "three";

// Material presets interface
export interface MaterialPreset {
  name: string;
  label: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  transmission: number;
  envMapIntensity: number;
}

// Environment preset interface
export interface EnvironmentPreset {
  name: string;
  label: string;
  color: string;
}

// Color preset interface
export interface ColorPreset {
  name: string;
  label: string;
  color: string;
}

// Resolution preset for image export
export interface ResolutionPreset {
  label: string;
  multiplier: number;
}

// Bevel preset interface
export interface BevelPreset {
  name: string;
  label: string;
  thickness: number;
  size: number;
  segments: number;
}

// Props for the SVG model component
export interface SVGModelProps {
  svgData: string;
  depth?: number;
  bevelEnabled?: boolean;
  bevelThickness?: number;
  bevelSize?: number;
  bevelSegments?: number;
  customColor?: string;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  envMapIntensity?: number;
  transmission?: number;
  receiveShadow?: boolean;
  castShadow?: boolean;
  isHollowSvg?: boolean;
  spread?: number;
}

// Props for the model preview component
export interface ModelPreviewProps {
  svgData: string;
  depth: number;
  modelRotationY: number;
  modelGroupRef: React.RefObject<THREE.Group | null>;
  modelRef: React.RefObject<THREE.Group | null>;
  // Geometry settings
  bevelEnabled: boolean;
  bevelThickness: number;
  bevelSize: number;
  bevelSegments: number;
  isHollowSvg: boolean;
  spread: number;
  // Material settings
  useCustomColor: boolean;
  customColor: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  transmission: number;
  envMapIntensity: number;
  // Environment settings
  backgroundColor: string;
  useEnvironment: boolean;
  environmentPreset: string;
  customHdriUrl: string | null;
  // Rendering options
  autoRotate: boolean;
  autoRotateSpeed: number;
  useBloom: boolean;
  bloomIntensity: number;
  bloomMipmapBlur: boolean;
  isMobile: boolean;
}

// Props for file upload component
export interface FileUploadProps {
  onFileUpload: (svgData: string, fileName: string) => void;
  fileName: string;
  selectedIcon?: string;
  onIconSelect?: (iconName: string) => void;
}

// Props for geometry controls component
export interface GeometryControlsProps {
  depth: number;
  setDepth: (depth: number) => void;
  bevelEnabled: boolean;
  setBevelEnabled: (enabled: boolean) => void;
  bevelThickness: number;
  setBevelThickness: (thickness: number) => void;
  bevelSize: number;
  setBevelSize: (size: number) => void;
  bevelSegments: number;
  setBevelSegments: (segments: number) => void;
  bevelPreset: string;
  setBevelPreset: (preset: string) => void;
  autoRotate: boolean;
  setAutoRotate: (autoRotate: boolean) => void;
  autoRotateSpeed: number;
  setAutoRotateSpeed: (speed: number) => void;
}

// Props for material controls component
export interface MaterialControlsProps {
  materialPreset: string;
  setMaterialPreset: (preset: string) => void;
  roughness: number;
  setRoughness: (roughness: number) => void;
  metalness: number;
  setMetalness: (metalness: number) => void;
  clearcoat: number;
  setClearcoat: (clearcoat: number) => void;
  transmission: number;
  setTransmission: (transmission: number) => void;
  envMapIntensity: number;
  setEnvMapIntensity: (intensity: number) => void;
  useCustomColor: boolean;
  setUseCustomColor: (useCustomColor: boolean) => void;
  customColor: string;
  setCustomColor: (color: string) => void;
}

// Props for environment controls component
export interface EnvironmentControlsProps {
  useEnvironment: boolean;
  setUseEnvironment: (useEnvironment: boolean) => void;
  environmentPreset: string;
  setEnvironmentPreset: (preset: string) => void;
  customHdriUrl: string | null;
  setCustomHdriUrl: (url: string | null) => void;
  useBloom: boolean;
  setUseBloom: (useBloom: boolean) => void;
  bloomIntensity: number;
  setBloomIntensity: (intensity: number) => void;
  bloomMipmapBlur: boolean;
  setBloomMipmapBlur: (blur: boolean) => void;
  modelRotationY: number;
  setModelRotationY: (rotation: number) => void;
  toggleVibeMode: (enabled: boolean) => void;
}

// Props for background controls component
export interface BackgroundControlsProps {
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  userSelectedBackground: boolean;
  setUserSelectedBackground: (selected: boolean) => void;
  solidColorPreset: string;
  setSolidColorPreset: (preset: string) => void;
  theme: string | undefined;
}

// Props for SimpleEnvironment component
export interface SimpleEnvironmentProps {
  environmentPreset: string;
  customHdriUrl: string | null;
}

// Props for CustomEnvironment component
export interface CustomEnvironmentProps {
  imageUrl: string;
}

// Props for mobile warning component
export interface MobileWarningProps {
  onContinue: () => void;
  onReturn: () => void;
}
