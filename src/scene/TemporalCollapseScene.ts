import * as THREE from 'three';
import type { Phase } from '@/types';
import { COLORS, CELEBRATION_COLORS } from '@/constants';

// Easing functions
const ease = {
  inQuad: (t: number) => t * t,
  outQuad: (t: number) => t * (2 - t),
  inOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  outCubic: (t: number) => (--t) * t * t + 1,
  outExpo: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  dramaticRamp: (t: number) => {
    if (t < 0.83) return t / 0.83 * 0.3;
    const normalized = (t - 0.83) / 0.17;
    return 0.3 + Math.pow(normalized, 2.5) * 0.7;
  }
};

const smoothLerp = (current: number, target: number, speed: number, dt: number) => {
  const factor = 1 - Math.pow(1 - speed, dt * 60);
  return current + (target - current) * factor;
};

interface BurstLayer {
  points: THREE.Points;
  velocities: Float32Array;
  lifetimes: Float32Array;
  startTime: number | null;
  delay: number;
}

interface Shockwave {
  mesh: THREE.Mesh;
  startTime: number;
  duration: number;
  maxRadius: number;
}

interface Firework {
  points: THREE.Points;
  velocities: { x: number; y: number; z: number }[];
  startTime: number;
  lifetime: number;
}

export class TemporalCollapseScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;

  private progress = 0;
  private phase: Phase = 'dormant';
  private smoothProgress = 0;
  private lastTime = 0;

  // Stars
  private stars!: THREE.Points;
  private starMaterial!: THREE.PointsMaterial;
  private starOriginalPositions!: Float32Array;

  // Time particles
  private timeParticles!: THREE.Points;
  private particleMaterial!: THREE.PointsMaterial;
  private particlePositions!: Float32Array;
  private particleInitialPositions!: Float32Array;
  private particleRandoms!: Float32Array;
  private particleVelocities!: Float32Array;

  // Burst system
  private burstLayers: BurstLayer[] = [];
  private climaxStartTime: number | null = null;
  private celebrationStartTime: number | null = null;

  // Shockwaves
  private shockwaves: Shockwave[] = [];

  // Fireworks
  private fireworkQueue: Firework[] = [];

  // Flash plane
  private flashPlane!: THREE.Mesh;
  private flashIntensity = 0;

  // Effects state
  private shakeIntensity = 0;
  private targetShakeIntensity = 0;
  private pulsePhase = 0;
  private heartbeatIntensity = 0;
  private baseFOV = 60;

  private isDisposed = false;

  constructor(container: HTMLElement) {
    this.container = container;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(COLORS.void.black);
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(COLORS.void.deep, 0.008);

    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 28;

    this.clock = new THREE.Clock();

    this.createStars();
    this.createTimeParticles();
    this.createBurstSystem();
    this.createFlashPlane();

    this.animate();
    window.addEventListener('resize', this.onResize);
  }

  private createFlashPlane() {
    const geometry = new THREE.PlaneGeometry(200, 200);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    this.flashPlane = new THREE.Mesh(geometry, material);
    this.flashPlane.position.z = 15;
    this.scene.add(this.flashPlane);
  }

  private createStars() {
    const count = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    this.starOriginalPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const r = 60 + Math.random() * 140;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      this.starOriginalPositions[i * 3] = x;
      this.starOriginalPositions[i * 3 + 1] = y;
      this.starOriginalPositions[i * 3 + 2] = z;

      sizes[i] = 0.5 + Math.random() * 1.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    this.starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.6,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });

    this.stars = new THREE.Points(geometry, this.starMaterial);
    this.scene.add(this.stars);
  }

  private createTimeParticles() {
    const count = 3000;
    const geometry = new THREE.BufferGeometry();

    this.particlePositions = new Float32Array(count * 3);
    this.particleInitialPositions = new Float32Array(count * 3);
    this.particleRandoms = new Float32Array(count);
    this.particleVelocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const r = 10 + Math.random() * 28;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      this.particlePositions[i * 3] = x;
      this.particlePositions[i * 3 + 1] = y;
      this.particlePositions[i * 3 + 2] = z;

      this.particleInitialPositions[i * 3] = x;
      this.particleInitialPositions[i * 3 + 1] = y;
      this.particleInitialPositions[i * 3 + 2] = z;

      this.particleRandoms[i] = Math.random();

      this.particleVelocities[i * 3] = 0;
      this.particleVelocities[i * 3 + 1] = 0;
      this.particleVelocities[i * 3 + 2] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    this.particleMaterial = new THREE.PointsMaterial({
      color: COLORS.glow.cyan,
      size: 0.2,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    this.timeParticles = new THREE.Points(geometry, this.particleMaterial);
    this.scene.add(this.timeParticles);
  }

  private createBurstSystem() {
    const layerConfigs = [
      { count: 3000, color: COLORS.glow.gold, size: 0.35, speed: 1.0 },
      { count: 2000, color: COLORS.glow.magenta, size: 0.3, speed: 0.85 },
      { count: 2000, color: COLORS.glow.cyan, size: 0.3, speed: 1.15 },
      { count: 1500, color: COLORS.glow.white, size: 0.4, speed: 0.7 },
      { count: 1000, color: COLORS.glow.orange, size: 0.25, speed: 1.3 }
    ];

    layerConfigs.forEach(config => {
      const layer = this.createBurstLayer(config);
      this.burstLayers.push(layer);
      this.scene.add(layer.points);
    });
  }

  private createBurstLayer({ count, color, size, speed }: { count: number; color: number; size: number; speed: number }): BurstLayer {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const baseSpeed = (15 + Math.random() * 35) * speed;

      velocities[i * 3] = baseSpeed * Math.sin(phi) * Math.cos(theta);
      velocities[i * 3 + 1] = baseSpeed * Math.sin(phi) * Math.sin(theta);
      velocities[i * 3 + 2] = baseSpeed * Math.cos(phi);

      lifetimes[i] = 2.5 + Math.random() * 3;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    return {
      points: new THREE.Points(geometry, material),
      velocities,
      lifetimes,
      startTime: null,
      delay: 0
    };
  }

  private addShockwave(color: number = COLORS.glow.gold, delay: number = 0, maxRadius: number = 50) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 0.8, 64),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0;
    this.scene.add(ring);

    this.shockwaves.push({
      mesh: ring,
      startTime: this.clock.getElapsedTime() + delay,
      duration: 3,
      maxRadius
    });
  }

  private triggerClimax() {
    if (this.climaxStartTime !== null) return;

    this.climaxStartTime = this.clock.getElapsedTime();
    this.shakeIntensity = 3.0;
    this.targetShakeIntensity = 3.0;

    this.burstLayers.forEach((layer, i) => {
      layer.startTime = this.climaxStartTime! + i * 0.1;
      layer.delay = i * 0.1;
    });

    this.addShockwave(COLORS.glow.white, 0, 80);
    this.addShockwave(COLORS.glow.gold, 0.15, 70);
    this.addShockwave(COLORS.glow.magenta, 0.3, 60);
    this.addShockwave(COLORS.glow.cyan, 0.45, 50);
    this.addShockwave(COLORS.glow.gold, 0.6, 40);
  }

  private triggerCelebration() {
    if (this.celebrationStartTime !== null) return;
    this.celebrationStartTime = this.clock.getElapsedTime();
  }

  private spawnFirework() {
    const angle = Math.random() * Math.PI * 2;
    const distance = 8 + Math.random() * 18;
    const x = Math.cos(angle) * distance;
    const y = -5 + Math.random() * 18;
    const z = Math.sin(angle) * distance;

    const color = CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)];

    const count = 400 + Math.floor(Math.random() * 300);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 4 + Math.random() * 10;

      velocities.push({
        x: speed * Math.sin(phi) * Math.cos(theta),
        y: speed * Math.sin(phi) * Math.sin(theta),
        z: speed * Math.cos(phi)
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color,
      size: 0.22 + Math.random() * 0.18,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);

    this.fireworkQueue.push({
      points,
      velocities,
      startTime: this.clock.getElapsedTime(),
      lifetime: 2.5 + Math.random()
    });
  }

  updateProgress(progress: number, phase: Phase) {
    this.progress = progress;

    if (phase === 'climax' && this.phase !== 'climax') {
      this.triggerClimax();
    }

    if (phase === 'celebration' && this.phase !== 'celebration') {
      this.triggerCelebration();
    }

    this.phase = phase;
  }

  private animate = () => {
    if (this.isDisposed) return;
    requestAnimationFrame(this.animate);

    const time = this.clock.getElapsedTime();
    const dt = Math.min(time - this.lastTime, 0.1);
    this.lastTime = time;

    this.smoothProgress = smoothLerp(this.smoothProgress, this.progress, 0.15, dt);
    const progress = this.smoothProgress;

    const dramaticIntensity = ease.dramaticRamp(progress);

    // Update heartbeat
    if (progress > 0.83 && this.phase !== 'climax' && this.phase !== 'celebration') {
      const heartbeatSpeed = 1 + (progress - 0.83) / 0.17 * 4;
      this.pulsePhase += dt * heartbeatSpeed * Math.PI * 2;
      this.heartbeatIntensity = Math.pow(Math.sin(this.pulsePhase), 2) * dramaticIntensity;

      if (progress > 0.95) {
        this.targetShakeIntensity = (progress - 0.95) / 0.05 * 1.5;
      }
    }

    this.shakeIntensity = smoothLerp(this.shakeIntensity, this.targetShakeIntensity, 0.1, dt);

    // Update camera
    const driftMultiplier = 1 + dramaticIntensity * 2;
    let camX = Math.sin(time * 0.1 * driftMultiplier) * (0.8 + dramaticIntensity * 0.5);
    let camY = Math.cos(time * 0.13 * driftMultiplier) * (0.5 + dramaticIntensity * 0.3);

    if (this.shakeIntensity > 0.01) {
      const shakeFreq = 1 + dramaticIntensity * 3;
      camX += (Math.sin(time * 50 * shakeFreq) + Math.random() - 0.5) * this.shakeIntensity;
      camY += (Math.cos(time * 47 * shakeFreq) + Math.random() - 0.5) * this.shakeIntensity;

      if (this.phase === 'climax' || this.phase === 'celebration') {
        this.shakeIntensity *= 0.92;
      }
    }

    if (this.phase === 'celebration') {
      const celebrationTime = time - (this.celebrationStartTime || 0);
      camX += Math.sin(celebrationTime * 2) * 0.4;
      camY += Math.cos(celebrationTime * 1.5) * 0.3;
    }

    this.camera.position.x = camX;
    this.camera.position.y = camY;
    this.camera.lookAt(0, 0, 0);

    // Update stars
    if (dramaticIntensity > 0.3) {
      const positions = this.stars.geometry.attributes.position.array as Float32Array;
      const count = positions.length / 3;
      const streakFactor = (dramaticIntensity - 0.3) / 0.7;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const pullStrength = streakFactor * 0.4;
        positions[i3] = this.starOriginalPositions[i3] * (1 - pullStrength);
        positions[i3 + 1] = this.starOriginalPositions[i3 + 1] * (1 - pullStrength);
        positions[i3 + 2] = this.starOriginalPositions[i3 + 2] * (1 - pullStrength);
      }
      this.stars.geometry.attributes.position.needsUpdate = true;
    }

    this.starMaterial.opacity = 0.7 + dramaticIntensity * 0.3;
    this.starMaterial.size = 0.6 + dramaticIntensity * 0.8;
    this.stars.rotation.y = time * (0.008 + dramaticIntensity * 0.02);
    this.stars.rotation.x = time * (0.003 + dramaticIntensity * 0.01);

    // Update time particles
    this.updateTimeParticles(time, dt, progress, dramaticIntensity);

    // Update burst layers
    this.updateBurstLayers(time);

    // Update shockwaves
    this.updateShockwaves(time);

    // Update flash plane
    this.flashIntensity *= 0.85;
    const heartbeatFlash = this.heartbeatIntensity * dramaticIntensity * 0.15;
    (this.flashPlane.material as THREE.MeshBasicMaterial).opacity = Math.min(1, this.flashIntensity + heartbeatFlash);

    // Celebration fireworks
    if (this.phase === 'celebration' && this.celebrationStartTime) {
      const elapsed = time - this.celebrationStartTime;
      const fireworkInterval = 0.35;
      const expectedFireworks = Math.floor(elapsed / fireworkInterval);

      while (this.fireworkQueue.length < expectedFireworks && this.fireworkQueue.length < 120) {
        this.spawnFirework();
      }
    }

    this.updateFireworks(time, dt);

    // Update particle color
    this.updateParticleColor(progress, time, dramaticIntensity);

    // FOV
    if (progress > 0.83) {
      const fovPulse = this.heartbeatIntensity * 8;
      this.camera.fov = this.baseFOV - fovPulse;
      this.camera.updateProjectionMatrix();
    }

    this.renderer.render(this.scene, this.camera);
  };

  private updateTimeParticles(time: number, _dt: number, progress: number, dramaticIntensity: number) {
    const positions = this.timeParticles.geometry.attributes.position.array as Float32Array;
    const count = positions.length / 3;

    const baseInward = 0.05 + dramaticIntensity * 0.95;
    const inwardForce = this.phase === 'climax' || this.phase === 'celebration' ? 0.95 : baseInward;

    let turbulence = 1.0 - dramaticIntensity * 0.9;
    if (progress > 0.9 && progress < 1) {
      turbulence += Math.sin(time * 20) * 0.2 * (1 - dramaticIntensity);
    }

    const spiralSpeed = 0.2 + dramaticIntensity * 4;
    const pulseCompression = this.heartbeatIntensity * 0.15;

    const celebrationExpand = this.phase === 'celebration' && this.celebrationStartTime
      ? Math.min(1, (time - this.celebrationStartTime) / 3) : 0;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const random = this.particleRandoms[i];

      let x = this.particleInitialPositions[i3];
      let y = this.particleInitialPositions[i3 + 1];
      let z = this.particleInitialPositions[i3 + 2];

      let compression = 1 - (inwardForce * 0.85) - pulseCompression;
      if (this.phase === 'celebration') {
        compression = 0.15 + celebrationExpand * 0.85;
      }

      x *= compression;
      y *= compression;
      z *= compression;

      const spiralMod = this.phase === 'celebration' ? 0.5 : 1;
      const angle = time * spiralSpeed * (0.3 + random * 0.7) * spiralMod;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const newX = x * cosA - z * sinA;
      const newZ = x * sinA + z * cosA;

      const turbMod = this.phase === 'celebration' ? 0.6 : turbulence;
      const noiseFreq = 0.4 + dramaticIntensity * 2;
      const noiseAmp = turbMod * (2 + dramaticIntensity * 3);
      const noiseX = Math.sin(time * noiseFreq + y * 0.06 + random * 10) * noiseAmp;
      const noiseY = Math.cos(time * noiseFreq + newZ * 0.06 + random * 10) * noiseAmp;
      const noiseZ = Math.sin(time * noiseFreq + newX * 0.06 + random * 10) * noiseAmp;

      positions[i3] = newX + noiseX;
      positions[i3 + 1] = y + noiseY;
      positions[i3 + 2] = newZ + noiseZ;
    }

    this.timeParticles.geometry.attributes.position.needsUpdate = true;
    this.timeParticles.rotation.y = time * (0.025 + dramaticIntensity * 0.1);

    const baseSizePulse = this.phase === 'celebration'
      ? 0.1 * Math.sin(time * 4) : this.heartbeatIntensity * 0.2;
    this.particleMaterial.size = 0.12 + dramaticIntensity * 0.35 + baseSizePulse;
    this.particleMaterial.opacity = 0.9 + this.heartbeatIntensity * 0.1;
  }

  private updateBurstLayers(time: number) {
    this.burstLayers.forEach((layer) => {
      if (layer.startTime === null) return;

      const elapsed = time - layer.startTime;
      if (elapsed < 0) return;

      const positions = layer.points.geometry.attributes.position.array as Float32Array;
      const count = positions.length / 3;

      const fadeIn = Math.min(1, elapsed * 4);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const lifetime = layer.lifetimes[i];
        const t = Math.min(1, elapsed / lifetime);

        const easeOut = ease.outCubic(1 - t);
        const gravity = -0.4 * elapsed * elapsed;

        positions[i3] = layer.velocities[i3] * elapsed * easeOut;
        positions[i3 + 1] = layer.velocities[i3 + 1] * elapsed * easeOut + gravity * 0.3 + elapsed * 0.6;
        positions[i3 + 2] = layer.velocities[i3 + 2] * elapsed * easeOut;
      }

      layer.points.geometry.attributes.position.needsUpdate = true;

      const fadeOut = Math.max(0, 1 - elapsed / 5);
      (layer.points.material as THREE.PointsMaterial).opacity = fadeIn * fadeOut;
    });
  }

  private updateShockwaves(time: number) {
    this.shockwaves = this.shockwaves.filter(wave => {
      const elapsed = time - wave.startTime;
      if (elapsed < 0) return true;

      const t = elapsed / wave.duration;
      if (t > 1) {
        this.scene.remove(wave.mesh);
        wave.mesh.geometry.dispose();
        (wave.mesh.material as THREE.Material).dispose();
        return false;
      }

      const radius = ease.outCubic(t) * wave.maxRadius;
      wave.mesh.scale.set(radius, radius, 1);
      (wave.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - ease.inQuad(t)) * 0.8;

      return true;
    });
  }

  private updateFireworks(time: number, dt: number) {
    this.fireworkQueue = this.fireworkQueue.filter(fw => {
      const elapsed = time - fw.startTime;
      const t = elapsed / fw.lifetime;

      if (t > 1) {
        this.scene.remove(fw.points);
        fw.points.geometry.dispose();
        (fw.points.material as THREE.Material).dispose();
        return false;
      }

      const positions = fw.points.geometry.attributes.position.array as Float32Array;
      const count = fw.velocities.length;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const vel = fw.velocities[i];
        const easeOut = ease.outCubic(1 - t);
        const gravity = -2.5 * elapsed * elapsed;

        positions[i3] += vel.x * dt * easeOut;
        positions[i3 + 1] += vel.y * dt * easeOut + gravity * dt;
        positions[i3 + 2] += vel.z * dt * easeOut;
      }

      fw.points.geometry.attributes.position.needsUpdate = true;
      (fw.points.material as THREE.PointsMaterial).opacity = 1 - ease.inQuad(t);

      return true;
    });
  }

  private updateParticleColor(progress: number, time: number, dramaticIntensity: number) {
    let color: THREE.Color;

    if (this.phase === 'celebration') {
      const hue = (time * 0.1) % 1;
      color = new THREE.Color().setHSL(hue, 1, 0.6);
    } else if (dramaticIntensity > 0.5) {
      const cycleSpeed = 0.5 + dramaticIntensity * 2;
      const hue = (time * cycleSpeed) % 1;
      const saturation = 0.8 + this.heartbeatIntensity * 0.2;
      color = new THREE.Color().setHSL(hue, saturation, 0.55 + this.heartbeatIntensity * 0.15);
    } else if (progress < 0.5) {
      const t = ease.inOutQuad(progress * 2);
      color = new THREE.Color(COLORS.glow.cyan).lerp(new THREE.Color(COLORS.glow.magenta), t);
    } else {
      const t = ease.inOutQuad((progress - 0.5) * 2);
      color = new THREE.Color(COLORS.glow.magenta).lerp(new THREE.Color(COLORS.glow.gold), t);
    }

    this.particleMaterial.color = color;
  }

  private onResize = () => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  dispose() {
    this.isDisposed = true;
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
