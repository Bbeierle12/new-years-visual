import { useEffect, useRef, type RefObject } from 'react';
import type { Phase } from '@/types';

interface UseSceneOptions {
  progress: number;
  phase: Phase;
}

interface SceneController {
  updateProgress: (progress: number, phase: Phase) => void;
  dispose: () => void;
}

export function useScene<T extends SceneController>(
  containerRef: RefObject<HTMLDivElement | null>,
  SceneClass: new (container: HTMLElement) => T,
  options: UseSceneOptions
): RefObject<T | null> {
  const sceneRef = useRef<T | null>(null);

  // Initialize scene
  useEffect(() => {
    if (!containerRef.current) return;

    sceneRef.current = new SceneClass(containerRef.current);

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, [SceneClass]);

  // Update scene on progress/phase change
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateProgress(options.progress, options.phase);
    }
  }, [options.progress, options.phase]);

  return sceneRef;
}
