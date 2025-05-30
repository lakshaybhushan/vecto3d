import type {
  EnvironmentPreset,
  ColorPreset,
  MaterialPreset,
  BevelPreset,
  ResolutionPreset,
  TexturePreset,
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
    name: "metallic",
    label: "Metallic",
    roughness: 0.1,
    metalness: 1.0,
    clearcoat: 0.5,
    transmission: 0,
    envMapIntensity: 1.5,
  },
  {
    name: "ceramic",
    label: "Ceramic",
    roughness: 0.8,
    metalness: 0.0,
    clearcoat: 0.1,
    transmission: 0,
    envMapIntensity: 0.6,
  },
  {
    name: "plastic",
    label: "Plastic",
    roughness: 0.3,
    metalness: 0.0,
    clearcoat: 0.2,
    transmission: 0,
    envMapIntensity: 0.7,
  },
  {
    name: "glass",
    label: "Glass",
    roughness: 0.0,
    metalness: 0.0,
    clearcoat: 1.0,
    transmission: 1.0,
    envMapIntensity: 2.5,
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

// Bevel presets
export const BEVEL_PRESETS: BevelPreset[] = [
  { name: "none", label: "None", thickness: 0, size: 0, segments: 1 },
  { name: "light", label: "Light", thickness: 0.5, size: 0.3, segments: 2 },
  { name: "medium", label: "Medium", thickness: 1.0, size: 0.5, segments: 4 },
  { name: "heavy", label: "Heavy", thickness: 2.0, size: 1.0, segments: 8 },
  { name: "custom", label: "Custom", thickness: 1.0, size: 0.5, segments: 4 },
];

// Texture presets
export const TEXTURE_PRESETS: TexturePreset[] = [
  // Wood textures
  {
    name: "oak",
    label: "Oak Wood",
    category: "wood",
    diffuseMap: "/textures/wood/oak_diffuse.jpg",
    normalMap: "/textures/wood/oak_normal.jpg",
    roughnessMap: "/textures/wood/oak_roughness.jpg",
    previewImage: "/textures/wood/previews/oak_preview.jpg",
    repeat: { x: 2, y: 2 },
    roughnessAdjust: 0.5,
    metalnessAdjust: 0.0,
    bumpScale: 0.02,
  },
  {
    name: "pine",
    label: "Pine Wood",
    category: "wood",
    diffuseMap: "/textures/wood/pine_diffuse.jpg",
    normalMap: "/textures/wood/pine_normal.jpg",
    roughnessMap: "/textures/wood/pine_roughness.jpg",
    previewImage: "/textures/wood/previews/pine_preview.jpg",
    repeat: { x: 3, y: 3 },
    roughnessAdjust: 0.6,
    metalnessAdjust: 0.0,
    bumpScale: 0.025,
  },
  {
    name: "oak_veneer",
    label: "Oak Veneer",
    category: "wood",
    diffuseMap: "/textures/wood/oak_veneer_diffuse.jpg",
    normalMap: "/textures/wood/oak_veneer_normal.jpg",
    roughnessMap: "/textures/wood/oak_veneer_roughness.jpg",
    aoMap: "/textures/wood/oak_veneer_ao.jpg",
    previewImage: "/textures/wood/previews/oak_veneer_preview.jpg",
    repeat: { x: 2, y: 2 },
    roughnessAdjust: 0.4,
    metalnessAdjust: 0.0,
    bumpScale: 0.02,
  },
  {
    name: "bark",
    label: "Bark Wood",
    category: "wood",
    diffuseMap: "/textures/wood/bark_diffuse.jpg",
    normalMap: "/textures/wood/bark_normal.jpg",
    roughnessMap: "/textures/wood/bark_roughness.jpg",
    previewImage: "/textures/wood/previews/bark_preview.jpg",
    repeat: { x: 4, y: 4 },
    roughnessAdjust: 0.8,
    metalnessAdjust: 0.0,
    bumpScale: 0.03,
  },

  // Stone textures
  {
    name: "concrete",
    label: "Brushed Concrete",
    category: "stone",
    diffuseMap: "/textures/stone/concrete_diffuse.jpg",
    normalMap: "/textures/stone/concrete_normal.jpg",
    roughnessMap: "/textures/stone/concrete_roughness.jpg",
    previewImage: "/textures/stone/previews/concrete_preview.jpg",
    repeat: { x: 3, y: 3 },
    roughnessAdjust: 0.7,
    metalnessAdjust: 0.0,
    bumpScale: 0.015,
  },
  {
    name: "rock",
    label: "Rocky Terrain",
    category: "stone",
    diffuseMap: "/textures/stone/rock_diffuse.jpg",
    normalMap: "/textures/stone/rock_normal.jpg",
    roughnessMap: "/textures/stone/rock_roughness.jpg",
    previewImage: "/textures/stone/previews/rock_preview.jpg",
    repeat: { x: 2, y: 2 },
    roughnessAdjust: 0.4,
    metalnessAdjust: 0.0,
    bumpScale: 0.01,
  },

  // Miscellaneous textures
  {
    name: "denim",
    label: "Denim Fabric",
    category: "miscellaneous",
    diffuseMap: "/textures/fabric/denim_diffuse.jpg",
    normalMap: "/textures/fabric/denim_normal.jpg",
    roughnessMap: "/textures/fabric/denim_roughness.jpg",
    previewImage: "/textures/fabric/previews/denim_preview.jpg",
    repeat: { x: 4, y: 4 },
    roughnessAdjust: 0.9,
    metalnessAdjust: 0.0,
    bumpScale: 0.025,
  },
  {
    name: "leather",
    label: "Leather",
    category: "miscellaneous",
    diffuseMap: "/textures/fabric/leather_diffuse.jpg",
    normalMap: "/textures/fabric/leather_normal.jpg",
    roughnessMap: "/textures/fabric/leather_roughness.jpg",
    previewImage: "/textures/fabric/previews/leather_preview.jpg",
    repeat: { x: 3, y: 3 },
    roughnessAdjust: 0.8,
    metalnessAdjust: 0.0,
    bumpScale: 0.02,
  },

  {
    name: "asphalt",
    label: "Asphalt",
    category: "miscellaneous",
    diffuseMap: "/textures/road/asphalt_diffuse.jpg",
    normalMap: "/textures/road/asphalt_normal.jpg",
    roughnessMap: "/textures/road/asphalt_roughness.jpg",
    aoMap: "/textures/road/asphalt_ao.jpg",
    previewImage: "/textures/road/previews/asphalt_preview.jpg",
    repeat: { x: 5, y: 5 },
    roughnessAdjust: 0.8,
    metalnessAdjust: 0.0,
    bumpScale: 0.01,
  },

  {
    name: "snow",
    label: "Snow",
    category: "miscellaneous",
    diffuseMap: "/textures/weather/snow_diffuse.jpg",
    normalMap: "/textures/weather/snow_normal.jpg",
    roughnessMap: "/textures/weather/snow_roughness.jpg",
    previewImage: "/textures/weather/previews/snow_preview.jpg",
    repeat: { x: 6, y: 6 },
    roughnessAdjust: 0.2,
    metalnessAdjust: 0.0,
    bumpScale: 0.005,
  },
];
