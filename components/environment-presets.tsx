import { useEffect } from "react";
import { Environment } from "@react-three/drei";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { CustomEnvironmentProps, SimpleEnvironmentProps } from "@/lib/types";

export function CustomEnvironment({ imageUrl }: CustomEnvironmentProps) {
  const texture = useTexture(imageUrl);

  useEffect(() => {
    if (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
    }
  }, [texture]);

  return <Environment map={texture} background={false} />;
}

export function SimpleEnvironment({
  environmentPreset,
  customHdriUrl,
}: SimpleEnvironmentProps) {
  return (
    <>
      {environmentPreset === "custom" && customHdriUrl ? (
        <CustomEnvironment imageUrl={customHdriUrl} />
      ) : (
        <Environment
          preset={
            environmentPreset as
              | "apartment"
              | "city"
              | "dawn"
              | "forest"
              | "lobby"
              | "night"
              | "park"
              | "studio"
              | "sunset"
              | "warehouse"
          }
          background={false}
        />
      )}
    </>
  );
}
