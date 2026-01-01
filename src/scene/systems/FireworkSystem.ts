import * as THREE from 'three';
import { CELEBRATION_COLORS } from '@/constants';
import { ease } from '@/utils/easing';

interface FireworkParticle {
  points: THREE.Points;
  velocities: { x: number; y: number; z: number }[];
  positions: Float32Array;
  startTime: number;
  lifetime: number;
  color: THREE.Color;
}

/**
 * FireworkSystem - Creates and manages celebratory firework explosions
 *
 * Spawns fireworks in a ring around the center with colorful particle bursts
 * that expand outward with gravity and fade over time.
 */
export class FireworkSystem {
  private fireworks: FireworkParticle[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Spawn a new firework at a random position around the scene
   */
  spawn(currentTime: number): void {
    // Random position in ring around center (distance 8-26, height -5 to 13)
    const angle = Math.random() * Math.PI * 2;
    const distance = 8 + Math.random() * 18;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    const y = -5 + Math.random() * 18;

    // Random color from CELEBRATION_COLORS
    const colorHex = CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)];
    const color = new THREE.Color(colorHex);

    // 400-700 particles per firework
    const particleCount = 400 + Math.floor(Math.random() * 300);

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const velocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      // All particles start at the same position
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Random spherical velocities (speed 4-14)
      const speed = 4 + Math.random() * 10;
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.acos(2 * Math.random() - 1);

      velocities.push({
        x: speed * Math.sin(theta) * Math.cos(phi),
        y: speed * Math.sin(theta) * Math.sin(phi),
        z: speed * Math.cos(theta)
      });

      // Slight color variation
      const colorVariation = 0.8 + Math.random() * 0.4;
      colors[i * 3] = color.r * colorVariation;
      colors[i * 3 + 1] = color.g * colorVariation;
      colors[i * 3 + 2] = color.b * colorVariation;

      // Random sizes
      sizes[i] = 1.5 + Math.random() * 2.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create material with additive blending for glow effect
    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);

    // Lifetime 2.5-3.5 seconds
    const lifetime = 2.5 + Math.random();

    this.fireworks.push({
      points,
      velocities,
      positions,
      startTime: currentTime,
      lifetime,
      color
    });
  }

  /**
   * Update all active fireworks
   */
  update(time: number, _dt: number): void {
    const toRemove: number[] = [];

    for (let i = 0; i < this.fireworks.length; i++) {
      const firework = this.fireworks[i];
      const elapsed = time - firework.startTime;
      const normalizedTime = elapsed / firework.lifetime;

      if (normalizedTime >= 1) {
        toRemove.push(i);
        continue;
      }

      // Apply easeOut for smooth deceleration
      const easedProgress = ease.outQuad(normalizedTime);
      const positionAttr = firework.points.geometry.getAttribute('position') as THREE.BufferAttribute;
      const positions = positionAttr.array as Float32Array;

      // Get initial position (all particles started at same position)
      const startX = firework.positions[0];
      const startY = firework.positions[1];
      const startZ = firework.positions[2];

      for (let j = 0; j < firework.velocities.length; j++) {
        const vel = firework.velocities[j];

        // Position = start + velocity * eased_time + gravity
        // Gravity effect: -2.5 * elapsed^2
        const gravityOffset = -2.5 * elapsed * elapsed;

        positions[j * 3] = startX + vel.x * easedProgress * firework.lifetime;
        positions[j * 3 + 1] = startY + vel.y * easedProgress * firework.lifetime + gravityOffset;
        positions[j * 3 + 2] = startZ + vel.z * easedProgress * firework.lifetime;
      }

      positionAttr.needsUpdate = true;

      // Fade opacity
      const material = firework.points.material as THREE.PointsMaterial;
      material.opacity = 1 - ease.inQuad(normalizedTime);
    }

    // Remove expired fireworks (in reverse order to maintain indices)
    for (let i = toRemove.length - 1; i >= 0; i--) {
      const index = toRemove[i];
      const firework = this.fireworks[index];

      this.scene.remove(firework.points);
      firework.points.geometry.dispose();
      (firework.points.material as THREE.Material).dispose();

      this.fireworks.splice(index, 1);
    }
  }

  /**
   * Clean up all fireworks and resources
   */
  dispose(): void {
    for (const firework of this.fireworks) {
      this.scene.remove(firework.points);
      firework.points.geometry.dispose();
      (firework.points.material as THREE.Material).dispose();
    }
    this.fireworks = [];
  }
}
