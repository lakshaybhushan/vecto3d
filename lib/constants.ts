import type {
  EnvironmentPreset,
  ColorPreset,
  MaterialPreset,
  BevelPreset,
  ResolutionPreset,
  TexturePreset,
  VideoResolutionPreset,
  AspectRatioPreset,
} from "./types";

// Environment presets with EXR files from @pmndrs/assets
export const ENVIRONMENT_PRESETS: EnvironmentPreset[] = [
  {
    name: "apartment",
    label: "Apartment",
    color: "#e0ccae",
    exrFile: "apartment.exr.js",
  },
  { name: "city", label: "City", color: "#b4bdc6", exrFile: "city.exr.js" },
  { name: "dawn", label: "Dawn", color: "#ffd0b0", exrFile: "bridge.exr.js" },
  {
    name: "forest",
    label: "Forest",
    color: "#a8c0a0",
    exrFile: "forest.exr.js",
  },
  { name: "lobby", label: "Lobby", color: "#d8c8b8", exrFile: "lobby.exr.js" },
  { name: "park", label: "Park", color: "#b3d9ff", exrFile: "park.exr.js" },
  {
    name: "studio",
    label: "Studio",
    color: "#d9d9d9",
    exrFile: "studio.exr.js",
  },
  {
    name: "sunset",
    label: "Sunset",
    color: "#ffb98c",
    exrFile: "sunset.exr.js",
  },
  {
    name: "warehouse",
    label: "Warehouse",
    color: "#9ba3ad",
    exrFile: "warehouse.exr.js",
  },
];

// Theme-aware background color presets
export const DARK_MODE_COLOR = "#181818";
export const LIGHT_MODE_COLOR = "#FFFFFF";

// Solid color presets
export const SOLID_COLOR_PRESETS: ColorPreset[] = [
  { name: "light", label: "Light", color: "#FFFFFF" },
  { name: "dark", label: "Dark", color: "#181818" },
  { name: "blue", label: "Blue", color: "#3C90FF" },
  { name: "yellow", label: "Yellow", color: "#FFD700" },
  { name: "green", label: "Green", color: "#90FF3C" },
];

// Material presets
export const MATERIAL_PRESETS: MaterialPreset[] = [
  {
    name: "matte_metal",
    label: "Matte Metal",
    roughness: 0.4,
    metalness: 1.0,
    clearcoat: 0.0,
    transmission: 0,
    envMapIntensity: 0.8,
  },
  {
    name: "brushed_metal",
    label: "Brushed Metal",
    roughness: 0.25,
    metalness: 1.0,
    clearcoat: 0.0,
    transmission: 0,
    envMapIntensity: 1.0,
  },
  {
    name: "polished_metal",
    label: "Polished Metal",
    roughness: 0.05,
    metalness: 1.0,
    clearcoat: 0.3,
    transmission: 0,
    envMapIntensity: 1.5,
  },
  {
    name: "plastic_glossy",
    label: "Glossy Plastic",
    roughness: 0.15,
    metalness: 0.0,
    clearcoat: 0.8,
    transmission: 0,
    envMapIntensity: 0.5,
  },
  {
    name: "plastic_matte",
    label: "Matte Plastic",
    roughness: 0.7,
    metalness: 0.0,
    clearcoat: 0.0,
    transmission: 0,
    envMapIntensity: 0.3,
  },
  {
    name: "glass_clear",
    label: "Clear Glass",
    roughness: 0.0,
    metalness: 0.0,
    clearcoat: 1.0,
    transmission: 0.95,
    envMapIntensity: 2.0,
  },
  {
    name: "glass_frosted",
    label: "Frosted Glass",
    roughness: 0.2,
    metalness: 0.0,
    clearcoat: 0.8,
    transmission: 0.8,
    envMapIntensity: 1.5,
  },
  {
    name: "custom",
    label: "Custom",
    roughness: 0.3,
    metalness: 0.5,
    clearcoat: 0,
    transmission: 0,
    envMapIntensity: 1.0,
  },
];

// PNG export resolutions
export const PNG_RESOLUTIONS: ResolutionPreset[] = [
  { label: "Low Quality", multiplier: 1 },
  { label: "Medium Quality", multiplier: 2 },
  { label: "High Quality", multiplier: 3 },
];

// Video export resolutions (high quality first)
export const VIDEO_RESOLUTIONS: VideoResolutionPreset[] = [
  { label: "4K (2160p)", width: 3840, height: 2160, bitrate: 20000000 },
  { label: "1440p", width: 2560, height: 1440, bitrate: 12000000 },
  { label: "1080p", width: 1920, height: 1080, bitrate: 8000000 },
  { label: "720p", width: 1280, height: 720, bitrate: 5000000 },
  { label: "480p", width: 854, height: 480, bitrate: 2500000 },
];

// Video aspect ratios
export const ASPECT_RATIOS: AspectRatioPreset[] = [
  { label: "16:9", value: "16:9", ratio: 16 / 9 },
  { label: "3:2", value: "3:2", ratio: 3 / 2 },
  { label: "4:3", value: "4:3", ratio: 4 / 3 },
  { label: "1:1", value: "1:1", ratio: 1 },
  { label: "9:16", value: "9:16", ratio: 9 / 16 },
];

// Bevel presets
export const BEVEL_PRESETS: BevelPreset[] = [
  {
    name: "none",
    label: "None",
    thickness: 0,
    size: 0,
    segments: 1,
    previewStyle: {
      borderRadius: "0px",
      boxShadow: "inset 2px -2px 4px rgba(255,255,255,0.4)",
    },
  },
  {
    name: "light",
    label: "Light",
    thickness: 0.5,
    size: 0.3,
    segments: 2,
    previewStyle: {
      borderRadius: "6px",
      boxShadow: "inset 2px -2px 4px rgba(255,255,255,0.4)",
    },
  },
  {
    name: "medium",
    label: "Medium",
    thickness: 1.0,
    size: 0.5,
    segments: 4,
    previewStyle: {
      borderRadius: "12px",
      boxShadow: "inset 3px -3px 6px rgba(255,255,255,0.4)",
    },
  },
  {
    name: "heavy",
    label: "Heavy",
    thickness: 2.0,
    size: 1.0,
    segments: 8,
    previewStyle: {
      borderRadius: "20px",
      boxShadow: "inset 4px -4px 8px rgba(255,255,255,0.4)",
    },
  },
  {
    name: "custom",
    label: "Custom",
    thickness: 1.0,
    size: 0.5,
    segments: 4,
    previewStyle: {
      borderRadius: "12px",
      boxShadow: "inset 4px -4px 8px rgba(255,255,255,0.4)",
    },
  },
];

const TEXTURE_BASE_URL = process.env.NEXT_PUBLIC_BLOB_URL
  ? `${process.env.NEXT_PUBLIC_BLOB_URL}/textures`
  : "/textures";

export const TEXTURE_PRESETS: TexturePreset[] = [
  {
    name: "oak",
    label: "Oak Wood",
    category: "wood",
    diffuseMap: `${TEXTURE_BASE_URL}/wood/oak_diffuse.jpg`,
    normalMap: `${TEXTURE_BASE_URL}/wood/oak_normal.jpg`,
    roughnessMap: `${TEXTURE_BASE_URL}/wood/oak_roughness.jpg`,
    previewImage: `${TEXTURE_BASE_URL}/wood/previews/oak_preview.jpg`,
    repeat: { x: 2, y: 2 },
    roughnessAdjust: 1.0,
    metalnessAdjust: 0.0,
    bumpScale: 0.05,
  },
  {
    name: "pine",
    label: "Pine Wood",
    category: "wood",
    diffuseMap: `${TEXTURE_BASE_URL}/wood/pine_diffuse.jpg`,
    normalMap: `${TEXTURE_BASE_URL}/wood/pine_normal.jpg`,
    roughnessMap: `${TEXTURE_BASE_URL}/wood/pine_roughness.jpg`,
    previewImage: `${TEXTURE_BASE_URL}/wood/previews/pine_preview.jpg`,
    repeat: { x: 3, y: 3 },
    roughnessAdjust: 1.0,
    metalnessAdjust: 0.0,
    bumpScale: 0.06,
  },
  {
    name: "bark",
    label: "Bark Wood",
    category: "wood",
    diffuseMap: `${TEXTURE_BASE_URL}/wood/bark_diffuse.jpg`,
    normalMap: `${TEXTURE_BASE_URL}/wood/bark_normal.jpg`,
    roughnessMap: `${TEXTURE_BASE_URL}/wood/bark_roughness.jpg`,
    previewImage: `${TEXTURE_BASE_URL}/wood/previews/bark_preview.jpg`,
    repeat: { x: 4, y: 4 },
    roughnessAdjust: 1.0,
    metalnessAdjust: 0.0,
    bumpScale: 0.08,
  },
  {
    name: "denim",
    label: "Denim Fabric",
    category: "miscellaneous",
    diffuseMap: `${TEXTURE_BASE_URL}/fabric/denim_diffuse.jpg`,
    normalMap: `${TEXTURE_BASE_URL}/fabric/denim_normal.jpg`,
    roughnessMap: `${TEXTURE_BASE_URL}/fabric/denim_roughness.jpg`,
    previewImage: `${TEXTURE_BASE_URL}/fabric/previews/denim_preview.jpg`,
    repeat: { x: 4, y: 4 },
    roughnessAdjust: 1.0,
    metalnessAdjust: 0.0,
    bumpScale: 0.06,
  },
  {
    name: "leather",
    label: "Leather",
    category: "miscellaneous",
    diffuseMap: `${TEXTURE_BASE_URL}/fabric/leather_diffuse.jpg`,
    normalMap: `${TEXTURE_BASE_URL}/fabric/leather_normal.jpg`,
    roughnessMap: `${TEXTURE_BASE_URL}/fabric/leather_roughness.jpg`,
    previewImage: `${TEXTURE_BASE_URL}/fabric/previews/leather_preview.jpg`,
    repeat: { x: 3, y: 3 },
    roughnessAdjust: 1.0,
    metalnessAdjust: 0.0,
    bumpScale: 0.05,
  },
];
