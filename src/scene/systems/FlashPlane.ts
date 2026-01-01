import * as THREE from 'three';

/**
 * FlashPlane - A large plane that creates flash and heartbeat lighting effects
 *
 * Used for dramatic lighting effects during climax and celebration phases.
 * The plane uses additive blending to create a bloom-like glow effect.
 */
export class FlashPlane {
  private mesh: THREE.Mesh;
  private material: THREE.MeshBasicMaterial;
  private flashIntensity: number = 0;
  private baseColor: THREE.Color;
  private hueOffset: number = 0;

  constructor(scene: THREE.Scene) {
    // Create large plane (200x200) at z=15
    const geometry = new THREE.PlaneGeometry(200, 200);

    this.baseColor = new THREE.Color(0xffffff);

    this.material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.z = 15;
    this.mesh.renderOrder = 999; // Render on top

    scene.add(this.mesh);
  }

  /**
   * Trigger an instant flash effect
   * @param intensity - Flash intensity (0-1)
   */
  triggerFlash(intensity: number): void {
    this.flashIntensity = Math.min(1, intensity);
  }

  /**
   * Update the flash plane each frame
   * @param time - Current time in seconds
   * @param dramaticIntensity - Overall dramatic intensity (0-1)
   * @param heartbeatIntensity - Heartbeat pulse intensity (0-1)
   */
  update(time: number, dramaticIntensity: number, heartbeatIntensity: number): void {
    // Decay flash: flashIntensity *= 0.85
    this.flashIntensity *= 0.85;

    // Add heartbeat contribution
    const heartbeatContribution = heartbeatIntensity * dramaticIntensity * 0.15;

    // Calculate total intensity
    const totalIntensity = Math.min(1, this.flashIntensity + heartbeatContribution);

    // Color shifts based on intensity
    if (dramaticIntensity > 0.7) {
      // Hue cycling when dramaticIntensity is high
      this.hueOffset += 0.02;
      const hue = (this.hueOffset % 1);

      // Create color from HSL
      this.baseColor.setHSL(hue, 0.8, 0.6);
      this.material.color.copy(this.baseColor);
    } else if (dramaticIntensity > 0.3) {
      // Warm colors during moderate intensity
      const warmHue = 0.08 + Math.sin(time * 2) * 0.05; // Orange to gold range
      this.baseColor.setHSL(warmHue, 0.9, 0.5 + dramaticIntensity * 0.3);
      this.material.color.copy(this.baseColor);
    } else {
      // Cool white/cyan for low intensity
      this.material.color.setHex(0xffffff);
    }

    // Set opacity based on total intensity
    this.material.opacity = totalIntensity * 0.4;
  }

  /**
   * Get the current flash intensity
   */
  getFlashIntensity(): number {
    return this.flashIntensity;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.mesh.parent?.remove(this.mesh);
  }
}
