import * as THREE from 'three';
import { COLORS } from '@/constants';
import { ease } from '@/utils/easing';

interface BurstLayerConfig {
  count: number;
  color: number;
  size: number;
  speed: number;
}

interface BurstLayer {
  points: THREE.Points;
  velocities: Float32Array;
  lifetimes: Float32Array;
  positions: Float32Array;
  startTime: number | null;
  delay: number;
  config: BurstLayerConfig;
}

/**
 * BurstSystem manages the climax explosion burst layers.
 * Creates multiple layers of particles that explode outward from the origin
 * with different colors, sizes, and speeds for a dramatic effect.
 */
export class BurstSystem {
  private layers: BurstLayer[] = [];
  private scene: THREE.Scene;
  private readonly GRAVITY = -9.8;
  private readonly FADE_DURATION = 5.0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.createLayers();
  }

  /**
   * Creates all burst layers with their unique configurations
   */
  private createLayers(): void {
    const layerConfigs: BurstLayerConfig[] = [
      { count: 3000, color: COLORS.glow.gold, size: 0.35, speed: 1.0 },
      { count: 2000, color: COLORS.glow.magenta, size: 0.3, speed: 0.85 },
      { count: 2000, color: COLORS.glow.cyan, size: 0.3, speed: 1.15 },
      { count: 1500, color: COLORS.glow.white, size: 0.4, speed: 0.7 },
      { count: 1000, color: COLORS.glow.orange, size: 0.25, speed: 1.3 },
    ];

    layerConfigs.forEach((config, index) => {
      const layer = this.createLayer(config.count, config.color, config.size, config.speed);
      layer.delay = index * 0.1;
      layer.config = config;
      this.layers.push(layer);
    });
  }

  /**
   * Creates a single burst layer with the specified parameters
   */
  private createLayer(count: number, color: number, size: number, speed: number): BurstLayer {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);

    // Initialize particles at origin with random spherical velocities
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Start at origin
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      // Random spherical direction
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const velocityMagnitude = (0.5 + Math.random() * 0.5) * speed * 30;

      velocities[i3] = Math.sin(phi) * Math.cos(theta) * velocityMagnitude;
      velocities[i3 + 1] = Math.sin(phi) * Math.sin(theta) * velocityMagnitude;
      velocities[i3 + 2] = Math.cos(phi) * velocityMagnitude;

      // Random lifetime between 2.5 and 5.5 seconds
      lifetimes[i] = 2.5 + Math.random() * 3.0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));

    const material = new THREE.PointsMaterial({
      color: color,
      size: size,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    points.visible = false;
    this.scene.add(points);

    return {
      points,
      velocities,
      lifetimes,
      positions,
      startTime: null,
      delay: 0,
      config: { count, color, size, speed },
    };
  }

  /**
   * Triggers all burst layers with staggered delays
   * @param startTime - The current time when the burst is triggered
   */
  trigger(startTime: number): void {
    this.layers.forEach((layer, _index) => {
      layer.startTime = startTime + layer.delay;
      layer.points.visible = true;

      // Reset positions to origin
      const positionAttribute = layer.points.geometry.getAttribute('position') as THREE.BufferAttribute;
      const positions = positionAttribute.array as Float32Array;
      for (let i = 0; i < positions.length; i++) {
        positions[i] = 0;
      }
      positionAttribute.needsUpdate = true;

      // Reset material opacity
      (layer.points.material as THREE.PointsMaterial).opacity = 1.0;
    });
  }

  /**
   * Updates all burst layers based on elapsed time
   * @param time - Current time in seconds
   */
  update(time: number): void {
    this.layers.forEach((layer) => {
      if (layer.startTime === null) return;

      const elapsed = time - layer.startTime;
      if (elapsed < 0) return;

      const positionAttribute = layer.points.geometry.getAttribute('position') as THREE.BufferAttribute;
      const positions = positionAttribute.array as Float32Array;

      for (let i = 0; i < layer.lifetimes.length; i++) {
        const i3 = i * 3;
        const particleLifetime = layer.lifetimes[i];

        if (elapsed > particleLifetime) {
          // Particle has expired, make it invisible by moving far away
          positions[i3] = 0;
          positions[i3 + 1] = -1000;
          positions[i3 + 2] = 0;
          continue;
        }

        const particleT = elapsed / particleLifetime;
        const particleEasedT = ease.outCubic(particleT);

        // Calculate position based on velocity and eased time
        positions[i3] = layer.velocities[i3] * particleEasedT * particleLifetime;
        positions[i3 + 1] =
          layer.velocities[i3 + 1] * particleEasedT * particleLifetime +
          0.5 * this.GRAVITY * elapsed * elapsed;
        positions[i3 + 2] = layer.velocities[i3 + 2] * particleEasedT * particleLifetime;
      }

      positionAttribute.needsUpdate = true;

      // Fade out over the fade duration
      const fadeProgress = Math.min(elapsed / this.FADE_DURATION, 1);
      const opacity = 1 - ease.inQuad(fadeProgress);
      (layer.points.material as THREE.PointsMaterial).opacity = Math.max(0, opacity);

      // Hide layer when fully faded
      if (opacity <= 0) {
        layer.points.visible = false;
      }
    });
  }

  /**
   * Cleans up all burst layers and removes them from the scene
   */
  dispose(): void {
    this.layers.forEach((layer) => {
      this.scene.remove(layer.points);
      layer.points.geometry.dispose();
      (layer.points.material as THREE.PointsMaterial).dispose();
    });
    this.layers = [];
  }
}
