import * as THREE from 'three';
import { ease } from '@/utils/easing';

/**
 * StarField - Background star particle system
 *
 * Manages 5000 stars distributed in a sphere that create
 * the cosmic background. Stars streak toward center during
 * intense phases for dramatic effect.
 */
export class StarField {
  private points: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private originalPositions: Float32Array;
  private scene: THREE.Scene | null = null;
  private readonly count = 5000;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);

    // Create stars distributed in a sphere (radius 60-200)
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // Random spherical distribution
      const radius = 60 + Math.random() * 140; // 60-200 range
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Star sizes 0.5-2.0
      sizes[i] = 0.5 + Math.random() * 1.5;
    }

    // Store original positions for streaking effect
    this.originalPositions = new Float32Array(positions);

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    this.material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.6,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(this.geometry, this.material);
    scene.add(this.points);
  }

  /**
   * Update star field each frame
   * @param time - Current time in seconds
   * @param dt - Delta time since last frame
   * @param dramaticIntensity - Intensity value 0-1 for effects
   */
  update(_time: number, dt: number, dramaticIntensity: number): void {
    const positions = this.geometry.attributes.position.array as Float32Array;

    // Stars streak toward center during intense phases (dramaticIntensity > 0.3)
    if (dramaticIntensity > 0.3) {
      const pullStrength = ease.inQuad((dramaticIntensity - 0.3) / 0.7);

      for (let i = 0; i < this.count; i++) {
        const i3 = i * 3;

        // Calculate direction to center
        const ox = this.originalPositions[i3];
        const oy = this.originalPositions[i3 + 1];
        const oz = this.originalPositions[i3 + 2];

        // Pull stars toward center based on intensity
        const targetX = ox * (1 - pullStrength * 0.7);
        const targetY = oy * (1 - pullStrength * 0.7);
        const targetZ = oz * (1 - pullStrength * 0.7);

        // Smooth interpolation
        positions[i3] = positions[i3] + (targetX - positions[i3]) * dt * 2;
        positions[i3 + 1] = positions[i3 + 1] + (targetY - positions[i3 + 1]) * dt * 2;
        positions[i3 + 2] = positions[i3 + 2] + (targetZ - positions[i3 + 2]) * dt * 2;
      }
    } else {
      // Return to original positions when not intense
      for (let i = 0; i < this.count; i++) {
        const i3 = i * 3;
        positions[i3] = positions[i3] + (this.originalPositions[i3] - positions[i3]) * dt * 0.5;
        positions[i3 + 1] = positions[i3 + 1] + (this.originalPositions[i3 + 1] - positions[i3 + 1]) * dt * 0.5;
        positions[i3 + 2] = positions[i3 + 2] + (this.originalPositions[i3 + 2] - positions[i3 + 2]) * dt * 0.5;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;

    // Update material opacity and size based on intensity
    // Opacity: 0.7 + dramaticIntensity * 0.3
    this.material.opacity = 0.7 + dramaticIntensity * 0.3;

    // Size: 0.6 + dramaticIntensity * 0.8
    this.material.size = 0.6 + dramaticIntensity * 0.8;

    // Slow rotation on Y and X axes
    this.points.rotation.y += dt * 0.02;
    this.points.rotation.x += dt * 0.01;
  }

  /**
   * Clean up resources and remove from scene
   */
  dispose(): void {
    if (this.scene) {
      this.scene.remove(this.points);
    }
    this.geometry.dispose();
    this.material.dispose();
  }
}
