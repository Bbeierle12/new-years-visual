import * as THREE from 'three';
import { COLORS } from '@/constants';
import { ease } from '@/utils/easing';

interface Shockwave {
  mesh: THREE.Mesh;
  startTime: number;
  duration: number;
  maxRadius: number;
}

/**
 * ShockwaveSystem creates expanding ring shockwave effects.
 * Used for dramatic visual impact during climax moments,
 * with multiple colorful rings expanding outward.
 */
export class ShockwaveSystem {
  private shockwaves: Shockwave[] = [];
  private scene: THREE.Scene;
  private readonly DEFAULT_DURATION = 2.0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Adds a single shockwave to the system
   * @param color - The color of the shockwave ring
   * @param delay - Delay before the shockwave starts (in seconds)
   * @param maxRadius - Maximum radius the shockwave will expand to
   * @param currentTime - Current time in seconds
   */
  add(
    color: number = COLORS.glow.gold,
    delay: number = 0,
    maxRadius: number = 50,
    currentTime: number
  ): void {
    // Create ring geometry - inner radius 0.1, outer radius 0.8, 64 segments
    const geometry = new THREE.RingGeometry(0.1, 0.8, 64);

    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);

    // Orient the ring to face the camera (in XY plane looking down Z)
    mesh.rotation.x = -Math.PI / 2;

    // Start with very small scale
    mesh.scale.set(0.01, 0.01, 0.01);

    this.scene.add(mesh);

    const shockwave: Shockwave = {
      mesh,
      startTime: currentTime + delay,
      duration: this.DEFAULT_DURATION,
      maxRadius,
    };

    this.shockwaves.push(shockwave);
  }

  /**
   * Triggers multiple dramatic shockwaves for the climax effect
   * @param currentTime - Current time in seconds
   */
  triggerClimax(currentTime: number): void {
    // Add multiple shockwaves with different colors, delays, and radii
    this.add(COLORS.glow.white, 0, 80, currentTime);
    this.add(COLORS.glow.gold, 0.15, 70, currentTime);
    this.add(COLORS.glow.magenta, 0.3, 60, currentTime);
    this.add(COLORS.glow.cyan, 0.45, 50, currentTime);
    this.add(COLORS.glow.gold, 0.6, 40, currentTime);
  }

  /**
   * Updates all shockwaves based on elapsed time
   * @param time - Current time in seconds
   */
  update(time: number): void {
    // Iterate backwards to safely remove expired shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const shockwave = this.shockwaves[i];
      const elapsed = time - shockwave.startTime;

      // Skip if shockwave hasn't started yet
      if (elapsed < 0) {
        shockwave.mesh.visible = false;
        continue;
      }

      shockwave.mesh.visible = true;

      // Calculate normalized progress (0 to 1)
      const t = elapsed / shockwave.duration;

      // Remove shockwave when animation is complete
      if (t > 1) {
        this.scene.remove(shockwave.mesh);
        shockwave.mesh.geometry.dispose();
        (shockwave.mesh.material as THREE.MeshBasicMaterial).dispose();
        this.shockwaves.splice(i, 1);
        continue;
      }

      // Expand radius with outCubic easing for smooth deceleration
      const radiusProgress = ease.outCubic(t);
      const currentRadius = shockwave.maxRadius * radiusProgress;
      shockwave.mesh.scale.set(currentRadius, currentRadius, currentRadius);

      // Fade out opacity with inQuad easing for natural fade
      const opacity = 1 - ease.inQuad(t);
      (shockwave.mesh.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  }

  /**
   * Cleans up all shockwaves and removes them from the scene
   */
  dispose(): void {
    this.shockwaves.forEach((shockwave) => {
      this.scene.remove(shockwave.mesh);
      shockwave.mesh.geometry.dispose();
      (shockwave.mesh.material as THREE.MeshBasicMaterial).dispose();
    });
    this.shockwaves = [];
  }
}
