# Mac Health

A native macOS menu bar application for monitoring system health. Built with Tauri v2 (Rust) + React + TypeScript + Tailwind CSS.

![Mac Health Screenshot](https://img.shields.io/badge/Platform-macOS-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Version](https://img.shields.io/github/v/release/DimaPhil/mac_health)

## Features

- **Dashboard** - Quick overview of RAM, CPU, Disk, and Battery status with visual indicators
- **Memory Monitor** - Memory pressure gauge, usage breakdown, top memory consumers, quick clean action
- **CPU Monitor** - Usage gauge, per-core usage bars, load averages, top CPU processes
- **Storage Monitor** - Donut chart with category breakdown (Apps, Documents, Photos, etc.), disk info
- **Battery Monitor** - Health percentage, cycle count, condition, temperature, voltage
- **Menu Bar App** - Lives in your menu bar, click to show/hide, click outside to dismiss

## Installation

### Download Release (Recommended)

1. Download the latest DMG from [Releases](https://github.com/DimaPhil/mac_health/releases)
2. Open the DMG and drag **Mac Health** to your Applications folder
3. On first launch, right-click the app → **Open** (to bypass Gatekeeper since the app is unsigned)
4. Grant permissions when prompted:
   - **Full Disk Access** - Required for storage category analysis
   - **Accessibility** - Required to force quit unresponsive processes

### Bypass Gatekeeper (Alternative)

If you see "App is damaged" or can't open the app:

```bash
xattr -cr "/Applications/Mac Health.app"
```

## Building from Source

### Prerequisites

- **Node.js** 18+ and npm
- **Rust** (install via [rustup](https://rustup.rs/))
- **Xcode Command Line Tools**: `xcode-select --install`

### Setup

```bash
# Clone the repository
git clone https://github.com/DimaPhil/mac_health.git
cd mac_health

# Install dependencies
npm install
```

### Development

```bash
# Start development server with hot reload
npm run tauri dev
```

### Production Build

```bash
# Build the app
npm run tauri build
```

Build outputs:
- `src-tauri/target/release/bundle/macos/Mac Health.app` - Application bundle
- `src-tauri/target/release/bundle/dmg/Mac Health_<version>_aarch64.dmg` - DMG installer

### Testing

```bash
# Run frontend tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run Rust tests
cd src-tauri && cargo test
```

### Linting

```bash
# Frontend
npm run lint
npm run format

# Rust
cd src-tauri && cargo clippy
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Zustand, Framer Motion
- **Backend**: Rust, Tauri v2
- **System Info**: sysinfo crate (RAM, CPU, Disk), battery crate
- **Build**: Vite, Cargo

## Project Structure

```
mac_health/
├── src/                    # React frontend
│   ├── components/         # Shared UI components & charts
│   ├── features/           # Feature modules (dashboard, memory, cpu, etc.)
│   ├── store/              # Zustand state management
│   ├── lib/                # Utilities and Tauri command wrappers
│   └── types/              # TypeScript interfaces
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── lib.rs          # Tauri setup, tray, commands
│   │   └── monitors/       # System monitor modules
│   └── icons/              # App and tray icons
└── ...
```

## Permissions

Mac Health requests the following permissions for full functionality:

| Permission | Purpose |
|------------|---------|
| Full Disk Access | Analyze storage by category (Apps, Documents, etc.) |
| Accessibility | Force quit unresponsive applications |

The app works without these permissions but with limited functionality.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with [Tauri](https://tauri.app/) and [Claude Code](https://claude.ai/code)
