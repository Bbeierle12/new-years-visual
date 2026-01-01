export const COLORS = {
  void: {
    black: 0x050508,
    deep: 0x0a0a12
  },
  glow: {
    cyan: 0x00F5FF,
    magenta: 0xFF00FF,
    gold: 0xFFD700,
    white: 0xFFFFFF,
    orange: 0xFF6B35,
    pink: 0xFF1493,
    lime: 0x39FF14,
    blue: 0x4169E1
  }
} as const;

export const CELEBRATION_COLORS = [
  0xFFD700,  // Gold
  0xFF00FF,  // Magenta
  0x00F5FF,  // Cyan
  0xFF6B35,  // Orange
  0xFF1493,  // Pink
  0x39FF14,  // Lime
  0x4169E1   // Blue
] as const;

export type GlowColor = keyof typeof COLORS.glow;
export type VoidColor = keyof typeof COLORS.void;
