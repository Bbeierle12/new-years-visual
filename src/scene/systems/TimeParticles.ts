import * as THREE from 'three';
import type { Phase } from '@/types';
import { COLORS } from '@/constants';
import { ease } from '@/utils/easing';

/**
 * TimeParticles - Main time particle vortex system
 *
 * Creates a dynamic vortex of 3000 particles that compress
 * toward the center as the countdown intensifies, then
 * explode outward during celebration.
 */
export class TimeParticles {
  private points: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private positions: Float32Array;
  private initialPositions: Float32Array;
  private randoms: Float32Array;
  private velocities: Float32Array;
  private scene: THREE.Scene | null = null;
  private readonly count = 3000;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.geometry = new THREE.BufferGeometry();

    this.positions = new Float32Array(this.count * 3);
    this.initialPositions = new Float32Array(this.count * 3);
    this.randoms = new Float32Array(this.count * 4); // 4 random values per particle
    this.velocities = new Float32Array(this.count * 3);

    // Create particles using Fibonacci sphere distribution
    // Initial radius 10-38
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const i4 = i * 4;

      // Fibonacci sphere distribution
      const theta = 2 * Math.PI * i / goldenRatio;
      const phi = Math.acos(1 - 2 * (i + 0.5) / this.count);

      // Radius variation 10-38
      const radius = 10 + Math.random() * 28;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      this.positions[i3] = x;
      this.positions[i3 + 1] = y;
      this.positions[i3 + 2] = z;

      // Store initial positions
      this.initialPositions[i3] = x;
      this.initialPositions[i3 + 1] = y;
      this.initialPositions[i3 + 2] = z;

      // Random values for turbulence and variation
      this.randoms[i4] = Math.random();     // Phase offset
      this.randoms[i4 + 1] = Math.random(); // Speed multiplier
      this.randoms[i4 + 2] = Math.random(); // Turbulence scale
      this.randoms[i4 + 3] = Math.random(); // Color offset

      // Initialize velocities to zero
      this.velocities[i3] = 0;
      this.velocities[i3 + 1] = 0;
      this.velocities[i3 + 2] = 0;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    this.material = new THREE.PointsMaterial({
      color: COLORS.glow.cyan,
      size: 1.5,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(this.geometry, this.material);
    scene.add(this.points);
  }

  /**
   * Update particles each frame
   * @param time - Current time in seconds
   * @param dt - Delta time since last frame
   * @param progress - Overall countdown progress 0-1
   * @param phase - Current phase of the countdown
   * @param dramaticIntensity - Intensity value 0-1
   * @param heartbeatIntensity - Heartbeat pulse intensity 0-1
   * @param celebrationStartTime - Time when celebration started (or null)
   */
  update(
    time: number,
    dt: number,
    progress: number,
    phase: Phase,
    dramaticIntensity: number,
    heartbeatIntensity: number,
    celebrationStartTime: number | null
  ): void {
    const positions = this.geometry.attributes.position.array as Float32Array;

    // Inward compression: 0.05 + dramaticIntensity * 0.95
    const inwardForce = 0.05 + dramaticIntensity * 0.95;

    // Spiral speed: 0.2 + dramaticIntensity * 4
    const spiralSpeed = 0.2 + dramaticIntensity * 4;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const i4 = i * 4;

      let x = positions[i3];
      let y = positions[i3 + 1];
      let z = positions[i3 + 2];

      const phaseOffset = this.randoms[i4];
      const speedMult = this.randoms[i4 + 1];
      const turbScale = this.randoms[i4 + 2];

      // Initial positions for reference
      const ix = this.initialPositions[i3];
      const iy = this.initialPositions[i3 + 1];
      const iz = this.initialPositions[i3 + 2];

      const initialRadius = Math.sqrt(ix * ix + iy * iy + iz * iz);
      const currentRadius = Math.sqrt(x * x + y * y + z * z);

      if (phase === 'celebration' && celebrationStartTime !== null) {
        // During celebration, particles expand back out
        const celebrationTime = time - celebrationStartTime;
        const expansionProgress = Math.min(celebrationTime / 3, 1); // 3 seconds to expand
        const expansionEased = ease.outBack(expansionProgress);

        // Target radius expands beyond initial
        const targetRadius = initialRadius * (1 + expansionEased * 0.5);
        const radiusDiff = targetRadius - currentRadius;

        // Apply expansion force
        if (currentRadius > 0.1) {
          const nx = x / currentRadius;
          const ny = y / currentRadius;
          const nz = z / currentRadius;

          this.velocities[i3] += nx * radiusDiff * dt * 2;
          this.velocities[i3 + 1] += ny * radiusDiff * dt * 2;
          this.velocities[i3 + 2] += nz * radiusDiff * dt * 2;
        }

        // Add joyful chaotic motion during celebration
        const celebrationTurb = 0.5 + Math.sin(time * 10 + phaseOffset * 6.28) * 0.3;
        this.velocities[i3] += (Math.random() - 0.5) * celebrationTurb * dt * 10;
        this.velocities[i3 + 1] += (Math.random() - 0.5) * celebrationTurb * dt * 10;
        this.velocities[i3 + 2] += (Math.random() - 0.5) * celebrationTurb * dt * 10;

      } else {
        // Compression based on inward force
        const targetRadius = initialRadius * (1 - inwardForce * 0.8);
        const radiusDiff = targetRadius - currentRadius;

        if (currentRadius > 0.1) {
          const nx = x / currentRadius;
          const ny = y / currentRadius;
          const nz = z / currentRadius;

          // Apply inward compression force
          this.velocities[i3] += nx * radiusDiff * dt * (1 + dramaticIntensity * 2);
          this.velocities[i3 + 1] += ny * radiusDiff * dt * (1 + dramaticIntensity * 2);
          this.velocities[i3 + 2] += nz * radiusDiff * dt * (1 + dramaticIntensity * 2);
        }

        // Spiral motion (speed increases with intensity)
        const spiralAngle = spiralSpeed * (0.5 + speedMult) * dt;
        const cosAngle = Math.cos(spiralAngle);
        const sinAngle = Math.sin(spiralAngle);

        // Rotate around Y axis for spiral
        const rotX = x * cosAngle - z * sinAngle;
        const rotZ = x * sinAngle + z * cosAngle;

        // Apply spiral through velocity adjustment
        this.velocities[i3] += (rotX - x) * 0.5;
        this.velocities[i3 + 2] += (rotZ - z) * 0.5;

        // Turbulence noise
        const turbulenceStrength = 0.5 + dramaticIntensity * 2;
        const turbX = Math.sin(time * 2 + phaseOffset * 10) * turbScale * turbulenceStrength;
        const turbY = Math.cos(time * 2.5 + phaseOffset * 8) * turbScale * turbulenceStrength;
        const turbZ = Math.sin(time * 1.8 + phaseOffset * 12) * turbScale * turbulenceStrength;

        this.velocities[i3] += turbX * dt;
        this.velocities[i3 + 1] += turbY * dt;
        this.velocities[i3 + 2] += turbZ * dt;
      }

      // Apply damping
      const damping = 0.95;
      this.velocities[i3] *= damping;
      this.velocities[i3 + 1] *= damping;
      this.velocities[i3 + 2] *= damping;

      // Update positions
      positions[i3] += this.velocities[i3] * dt * 60;
      positions[i3 + 1] += this.velocities[i3 + 1] * dt * 60;
      positions[i3 + 2] += this.velocities[i3 + 2] * dt * 60;
    }

    this.geometry.attributes.position.needsUpdate = true;

    // Size and opacity pulse with heartbeat
    const baseSizeMultiplier = 1 + dramaticIntensity * 0.5;
    const heartbeatPulse = 1 + heartbeatIntensity * 0.3;
    this.material.size = 1.5 * baseSizeMultiplier * heartbeatPulse;

    const baseOpacity = 0.7 + dramaticIntensity * 0.3;
    this.material.opacity = baseOpacity * (0.9 + heartbeatIntensity * 0.1);

    // Update color
    this.updateColor(progress, time, dramaticIntensity, heartbeatIntensity, phase);
  }

  /**
   * Update particle color based on progress and phase
   * @param progress - Overall countdown progress 0-1
   * @param time - Current time in seconds
   * @param dramaticIntensity - Intensity value 0-1
   * @param heartbeatIntensity - Heartbeat pulse intensity 0-1
   * @param phase - Current countdown phase
   */
  updateColor(
    progress: number,
    time: number,
    dramaticIntensity: number,
    heartbeatIntensity: number,
    phase: Phase
  ): void {
    const color = new THREE.Color();

    if (phase === 'celebration') {
      // Rainbow cycling during celebration
      const hue = (time * 0.5) % 1;
      color.setHSL(hue, 1, 0.6);
    } else if (dramaticIntensity > 0.5) {
      // Rapid color cycling during intense phase
      const cycleSpeed = 2 + dramaticIntensity * 3;
      const cyclePhase = (time * cycleSpeed) % 3;

      if (cyclePhase < 1) {
        // Cyan to Magenta
        color.lerpColors(
          new THREE.Color(COLORS.glow.cyan),
          new THREE.Color(COLORS.glow.magenta),
          cyclePhase
        );
      } else if (cyclePhase < 2) {
        // Magenta to Gold
        color.lerpColors(
          new THREE.Color(COLORS.glow.magenta),
          new THREE.Color(COLORS.glow.gold),
          cyclePhase - 1
        );
      } else {
        // Gold to Cyan
        color.lerpColors(
          new THREE.Color(COLORS.glow.gold),
          new THREE.Color(COLORS.glow.cyan),
          cyclePhase - 2
        );
      }

      // Add white flash on heartbeat
      if (heartbeatIntensity > 0.5) {
        const flashAmount = (heartbeatIntensity - 0.5) * 2;
        color.lerp(new THREE.Color(COLORS.glow.white), flashAmount * 0.3);
      }
    } else {
      // Color shifts: cyan -> magenta -> gold based on progress
      if (progress < 0.33) {
        // Cyan dominant
        const t = progress / 0.33;
        color.lerpColors(
          new THREE.Color(COLORS.glow.cyan),
          new THREE.Color(COLORS.glow.magenta),
          ease.inOutQuad(t) * 0.5
        );
      } else if (progress < 0.66) {
        // Transition to magenta
        const t = (progress - 0.33) / 0.33;
        color.lerpColors(
          new THREE.Color(COLORS.glow.cyan).lerp(new THREE.Color(COLORS.glow.magenta), 0.5),
          new THREE.Color(COLORS.glow.magenta),
          ease.inOutQuad(t)
        );
      } else {
        // Transition to gold
        const t = (progress - 0.66) / 0.34;
        color.lerpColors(
          new THREE.Color(COLORS.glow.magenta),
          new THREE.Color(COLORS.glow.gold),
          ease.inOutQuad(t)
        );
      }
    }

    this.material.color.copy(color);
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
