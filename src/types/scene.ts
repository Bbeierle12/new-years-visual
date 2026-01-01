import type { Phase } from './countdown';
import * as THREE from 'three';

/**
 * Interface for particle systems that can be initialized, updated, and disposed.
 */
export interface ParticleSystem {
  /** Initialize the particle system and add it to the scene */
  init(scene: THREE.Scene): void;

  /** Update the particle system each frame */
  update(time: number, deltaTime: number, progress: number, phase: Phase): void;

  /** Clean up resources and remove from scene */
  dispose(): void;
}

/**
 * Represents a burst layer in an explosion effect
 */
export interface BurstLayer {
  particles: THREE.Points;
  velocities: THREE.Vector3[];
  colors: THREE.Color[];
  baseColor: THREE.Color;
  startTime: number;
  lifetime: number;
  gravity: number;
  drag: number;
  fadeStart: number;
}

/**
 * Represents a firework with multiple burst layers
 */
export interface Firework {
  position: THREE.Vector3;
  layers: BurstLayer[];
  startTime: number;
  hasExploded: boolean;
  rocketTrail?: THREE.Points;
  rocketVelocity?: THREE.Vector3;
  targetHeight: number;
}

/**
 * Represents a shockwave effect
 */
export interface Shockwave {
  mesh: THREE.Mesh;
  startTime: number;
  duration: number;
  maxScale: number;
  position: THREE.Vector3;
}

/**
 * Overall scene state containing all active effects
 */
export interface SceneState {
  fireworks: Firework[];
  shockwaves: Shockwave[];
  particleSystems: ParticleSystem[];
  lastSpawnTime: number;
  isActive: boolean;
}
