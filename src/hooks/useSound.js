// src/hooks/useSound.js
import { useCallback } from "react";

export const useSound = (soundFile, volume = 0.3) => {
  const play = useCallback(() => {
    const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    if (!soundEnabled) return;
    const audio = new Audio(soundFile);
    audio.volume = volume;
    audio.play().catch(() => {}); // ignore autoplay errors
  }, [soundFile, volume]);

  return play;
};
