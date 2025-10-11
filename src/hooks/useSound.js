import { useCallback } from "react";

export const useSound = (filePath, volume = 0.3) => {
  const play = useCallback(() => {
    const audio = new Audio(filePath);
    audio.volume = volume;
    audio.currentTime = 0; // makes sure it plays from start every time
    audio.play().catch(() => {}); // ignore autoplay restrictions
  }, [filePath, volume]);

  return play;
};
