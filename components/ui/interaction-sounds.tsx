"use client";

import { useEffect } from "react";
import { bind, setVolume } from "cuelume";

const INTERACTION_VOLUME = 0.22;

export function InteractionSounds() {
  useEffect(() => {
    setVolume(INTERACTION_VOLUME);
    bind();
  }, []);

  return null;
}
