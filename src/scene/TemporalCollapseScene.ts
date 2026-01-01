import * as THREE from 'three';
import type { Phase } from '@/types';
import { COLORS } from '@/constants';
import { smoothLerp } from '@/utils/math';
import { ease } from '@/utils/easing';
import { StarField } from './systems/StarField';
import { TimeParticles } from './systems/TimeParticles';
import { BurstSystem } from './systems/BurstSystem';
import { ShockwaveSystem } from './systems/ShockwaveSystem';
import { FireworkSystem } from './systems/FireworkSystem';
import { FlashPlane } from './systems/FlashPlane';

/**
 * TemporalCollapseScene - Main orchestrator for the New Year's countdown visualization
 *
 * This class composes all particle systems and effects, managing the animation loop,
 * camera movements, dramatic effects, and phase transitions.
 */
export class TemporalCollapseScene {
  // Core Three.js components
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;

  // Particle systems
  private starField: StarField;
  private timeParticles: TimeParticles;
  private burstSystem: BurstSystem;
  private shockwaveSystem: ShockwaveSystem;
  private fireworkSystem: FireworkSystem;
  private flashPlane: FlashPlane;

  // State tracking
  private progress = 0;
  private phase: Phase = 'dormant';
  private smoothProgress = 0;
  private climaxStartTime: number | null = null;
  private celebrationStartTime: number | null = null;
  private lastFireworkTime = 0;

  // Shake and visual effects
  private shakeIntensity = 0;
  private targetShakeIntensity = 0;
  private pulsePhase = 0;
  private heartbeatIntensity = 0;
  private baseFOV = 60;

  // Camera state
  private basePosition = new THREE.Vector3(0, 0, 30);
  private animationFrameId: number | null = null;
  private isDisposed = false;

  // Container reference for resize handling
  private container: HTMLElement;
  private resizeHandler: () => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.resizeHandler = this.handleResize.bind(this);

    // Initialize Three.js components
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor(COLORS.void.black, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    // Setup camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(this.baseFOV, aspect, 0.1, 1000);
    this.camera.position.copy(this.basePosition);
    this.camera.lookAt(0, 0, 0);

    // Add fog for depth
    this.scene.fog = new THREE.FogExp2(COLORS.void.deep, 0.008);

    // Create all particle systems
    this.starField = new StarField(this.scene);
    this.timeParticles = new TimeParticles(this.scene);
    this.burstSystem = new BurstSystem(this.scene);
    this.shockwaveSystem = new ShockwaveSystem(this.scene);
    this.fireworkSystem = new FireworkSystem(this.scene);
    this.flashPlane = new FlashPlane(this.scene);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    // Add resize listener
    window.addEventListener('resize', this.resizeHandler);

    // Start animation loop
    this.animate();
  }

  /**
   * Update the countdown progress and phase
   */
  updateProgress(progress: number, phase: Phase): void {
    const previousPhase = this.phase;
    this.progress = progress;
    this.phase = phase;

    // Trigger climax if transitioning to climax phase
    if (phase === 'climax' && previousPhase !== 'climax') {
      this.triggerClimax();
    }

    // Trigger celebration if transitioning to celebration phase
    if (phase === 'celebration' && previousPhase !== 'celebration') {
      this.triggerCelebration();
    }
  }

  /**
   * Trigger the climax explosion effect
   */
  private triggerClimax(): void {
    const time = this.clock.getElapsedTime();
    this.climaxStartTime = time;

    // Trigger burst system with multiple layers
    this.burstSystem.trigger(time);

    // Trigger multiple shockwaves
    this.shockwaveSystem.triggerClimax(time);

    // Maximum shake intensity
    this.targetShakeIntensity = 3.0;

    // Trigger bright flash
    this.flashPlane.triggerFlash(1.0);
  }

  /**
   * Trigger the celebration phase
   */
  private triggerCelebration(): void {
    this.celebrationStartTime = this.clock.getElapsedTime();
    this.targetShakeIntensity = 0.5;

    // Initial burst of fireworks
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        if (!this.isDisposed) {
          this.fireworkSystem.spawn(this.clock.getElapsedTime());
        }
      }, i * 200);
    }
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    if (this.isDisposed) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Main animation loop
   */
  private animate = (): void => {
    if (this.isDisposed) return;

    this.animationFrameId = requestAnimationFrame(this.animate);

    const time = this.clock.getElapsedTime();
    const dt = Math.min(this.clock.getDelta(), 0.1); // Cap delta time

    // Calculate dramatic intensity based on progress
    const dramaticIntensity = ease.dramaticRamp(this.progress);

    // Smooth progress for gradual transitions
    this.smoothProgress = smoothLerp(this.smoothProgress, this.progress, 0.1, dt);

    // Update heartbeat intensity (pulses faster as we approach climax)
    const heartbeatSpeed = 1 + dramaticIntensity * 4;
    this.pulsePhase += dt * heartbeatSpeed;
    this.heartbeatIntensity = Math.pow(Math.sin(this.pulsePhase * Math.PI), 8);

    // Update shake intensity with smoothing
    this.shakeIntensity = smoothLerp(this.shakeIntensity, this.targetShakeIntensity, 0.1, dt);

    // Decay target shake intensity
    this.targetShakeIntensity *= 0.98;

    // Update all particle systems
    this.starField.update(time, dt, dramaticIntensity);
    this.timeParticles.update(
      time,
      dt,
      this.smoothProgress,
      this.phase,
      dramaticIntensity,
      this.heartbeatIntensity,
      this.celebrationStartTime
    );
    this.burstSystem.update(time);
    this.shockwaveSystem.update(time);
    this.fireworkSystem.update(time, dt);
    this.flashPlane.update(time, dramaticIntensity, this.heartbeatIntensity);

    // Spawn fireworks during celebration
    if (this.phase === 'celebration') {
      const fireworkInterval = 0.3 + Math.random() * 0.4;
      if (time - this.lastFireworkTime > fireworkInterval) {
        this.fireworkSystem.spawn(time);
        this.lastFireworkTime = time;

        // Occasional flash with fireworks
        if (Math.random() > 0.7) {
          this.flashPlane.triggerFlash(0.3);
        }
      }
    }

    // Update camera with shake effect
    this.updateCamera(time, dt, dramaticIntensity);

    // Update FOV for dramatic zoom effect
    this.updateFOV(dramaticIntensity);

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Update camera position with shake and movement effects
   */
  private updateCamera(time: number, dt: number, dramaticIntensity: number): void {
    // Base camera movement - gentle orbit
    const orbitSpeed = 0.05 + dramaticIntensity * 0.1;
    const orbitRadius = 2 + dramaticIntensity * 3;

    const targetX = Math.sin(time * orbitSpeed) * orbitRadius;
    const targetY = Math.cos(time * orbitSpeed * 0.7) * orbitRadius * 0.5;

    // Add shake
    const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
    const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
    const shakeZ = (Math.random() - 0.5) * this.shakeIntensity * 0.5;

    // Calculate final position
    this.camera.position.x = smoothLerp(
      this.camera.position.x,
      this.basePosition.x + targetX + shakeX,
      0.05,
      dt
    );
    this.camera.position.y = smoothLerp(
      this.camera.position.y,
      this.basePosition.y + targetY + shakeY,
      0.05,
      dt
    );
    this.camera.position.z = smoothLerp(
      this.camera.position.z,
      this.basePosition.z + shakeZ,
      0.05,
      dt
    );

    // During climax, pull camera back then forward
    if (this.climaxStartTime !== null) {
      const climaxElapsed = time - this.climaxStartTime;

      if (climaxElapsed < 0.5) {
        // Pull back
        this.camera.position.z = this.basePosition.z + 10 * (1 - climaxElapsed * 2);
      } else if (climaxElapsed < 1.5) {
        // Rush forward
        const rushProgress = (climaxElapsed - 0.5) / 1.0;
        this.camera.position.z = this.basePosition.z + 5 * (1 - ease.outExpo(rushProgress));
      }
    }

    // Always look at center with slight offset
    const lookAtY = Math.sin(time * 0.3) * 0.5 * dramaticIntensity;
    this.camera.lookAt(0, lookAtY, 0);
  }

  /**
   * Update field of view for dramatic zoom effect
   */
  private updateFOV(dramaticIntensity: number): void {
    // Narrow FOV during intense moments for more dramatic feel
    const targetFOV = this.baseFOV - dramaticIntensity * 15;

    // Add heartbeat pulse to FOV
    const fovPulse = this.heartbeatIntensity * dramaticIntensity * 3;

    this.camera.fov = smoothLerp(
      this.camera.fov,
      targetFOV + fovPulse,
      0.1,
      this.clock.getDelta() || 0.016
    );
    this.camera.updateProjectionMatrix();
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    this.isDisposed = true;

    // Cancel animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Remove event listeners
    window.removeEventListener('resize', this.resizeHandler);

    // Dispose all systems
    this.starField.dispose();
    this.timeParticles.dispose();
    this.burstSystem.dispose();
    this.shockwaveSystem.dispose();
    this.fireworkSystem.dispose();
    this.flashPlane.dispose();

    // Dispose Three.js resources
    this.renderer.dispose();

    // Remove canvas from DOM
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    // Clear scene
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose());
        } else {
          object.material?.dispose();
        }
      }
    });
    this.scene.clear();
  }
}
