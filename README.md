# New Year's Visual Countdown

A stunning Three.js-powered New Year's Eve countdown visualization with particle effects, fireworks, and dramatic transitions.

## Features

- Real-time countdown to midnight
- Dynamic particle vortex that intensifies as midnight approaches
- Multiple phases: calm, building, intense, final, climax, celebration
- Spectacular fireworks and shockwave effects at midnight
- Debug mode for testing different phases
- Fully responsive design

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Three.js** - 3D graphics and particle systems
- **Vite** - Build tool
- **Vitest** - Testing framework

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/new-years-visual.git
cd new-years-visual

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development

```bash
# Run development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── CountdownDisplay/  # Time display with effects
│   ├── DebugControls/     # Debug mode controls
│   ├── ScreenFlash/       # Flash effect component
│   └── TemporalCollapse/  # Main orchestrator component
├── scene/               # Three.js scene and systems
│   ├── systems/           # Particle systems
│   │   ├── StarField.ts
│   │   ├── TimeParticles.ts
│   │   ├── BurstSystem.ts
│   │   ├── ShockwaveSystem.ts
│   │   ├── FireworkSystem.ts
│   │   └── FlashPlane.ts
│   └── TemporalCollapseScene.ts
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── constants/           # Shared constants
└── types/               # TypeScript type definitions
```

## Debug Mode

Enable debug mode using the controls at the bottom of the screen to:
- Manually control the countdown progress
- Jump to specific phases
- Test the climax and celebration effects

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Deploy (Vite is auto-detected)

### Manual

```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

## License

MIT
