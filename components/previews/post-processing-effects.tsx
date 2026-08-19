"use client";

import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export interface PostProcessingEffectsProps {
  isMobile: boolean;
  useBloom: boolean;
  bloomIntensity: number;
  bloomMipmapBlur: boolean;
  useChromaticAberration: boolean;
  chromaticAberrationIntensity: number;
  useGrain: boolean;
  grainIntensity: number;
  useVignette: boolean;
  vignetteIntensity: number;
}

export function PostProcessingEffects({
  isMobile,
  useBloom,
  bloomIntensity,
  bloomMipmapBlur,
  useChromaticAberration,
  chromaticAberrationIntensity,
  useGrain,
  grainIntensity,
  useVignette,
  vignetteIntensity,
}: PostProcessingEffectsProps) {
  return (
    <EffectComposer
      multisampling={isMobile ? 0 : 2}
      enableNormalPass={false}>
      {useBloom ? (
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={0.88}
          luminanceSmoothing={0.24}
          mipmapBlur={bloomMipmapBlur}
          radius={0.42}
        />
      ) : null}
      {useChromaticAberration ? (
        <ChromaticAberration
          offset={[
            chromaticAberrationIntensity,
            chromaticAberrationIntensity * 0.45,
          ]}
        />
      ) : null}
      {useGrain ? (
        <Noise
          opacity={grainIntensity}
          premultiply
          blendFunction={BlendFunction.SOFT_LIGHT}
        />
      ) : null}
      {useVignette ? (
        <Vignette offset={0.22} darkness={vignetteIntensity} />
      ) : null}
    </EffectComposer>
  );
}
