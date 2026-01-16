# Mac Health

A native macOS health monitoring application built with Tauri v2, React, TypeScript, and Tailwind CSS.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Desktop Runtime**: Tauri v2 (Rust)
- **Testing**: Vitest + React Testing Library (frontend), Cargo test (Rust)
- **Linting**: ESLint + Prettier (frontend), Clippy (Rust)

## Project Structure

```
mac_health/
├── src/                          # React frontend source
│   ├── App.tsx                   # Main app with view container
│   ├── main.tsx                  # React entry point
│   ├── index.css                 # Tailwind CSS + custom styles
│   ├── types/                    # TypeScript interfaces
│   │   └── index.ts              # RamInfo, CpuInfo, BatteryInfo, etc.
│   ├── lib/                      # Utilities
│   │   ├── tauri.ts              # Tauri command wrappers
│   │   └── formatters.ts         # Byte/time formatters
│   ├── store/                    # State management
│   │   └── systemStore.ts        # Zustand store
│   ├── hooks/                    # Custom hooks
│   │   └── usePolling.ts         # Data polling hook
│   ├── components/               # Shared components
│   │   ├── charts/               # CircularProgress, BarChart
│   │   └── ui/                   # StatusBadge, BackButton
│   └── features/                 # Feature modules
│       ├── dashboard/            # Dashboard + widgets
│       ├── memory/               # Memory detail view
│       ├── storage/              # Storage detail view
│       ├── battery/              # Battery detail view
│       └── cpu/                  # CPU detail view
├── src-tauri/                    # Tauri/Rust backend
│   ├── src/
│   │   ├── lib.rs                # App setup, tray, command registration
│   │   ├── main.rs               # Binary entry point
│   │   └── monitors/             # System monitor modules
│   │       ├── mod.rs
│   │       ├── ram.rs            # RAM info + processes
│   │       ├── cpu.rs            # CPU info + processes
│   │       ├── battery.rs        # Battery health
│   │       └── disk.rs           # Disk info
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # Window + tray config
├── .github/workflows/            # CI configuration
└── .husky/                       # Git hooks
```

## Architecture

### Menu Bar Application
- System tray icon in macOS menu bar
- Click to show/hide popover window (380x520px)
- Click outside to dismiss

### Frontend (React + Zustand + Framer Motion)
- Dashboard with 4 widget cards (RAM, Disk, Battery, CPU)
- Detail views with slide animations
- Real-time polling (3s interval)

### Backend (Rust + Tauri v2)
- `sysinfo` crate for RAM, CPU, disk metrics
- `battery` crate for battery health
- Tauri commands exposed to frontend

## Commands

### Development
```bash
npm run dev          # Start Vite dev server
npm run tauri dev    # Start Tauri development mode
```

### Building
```bash
npm run build        # Build frontend
npm run tauri build  # Build production app
```

### Testing
```bash
npm run test              # Run frontend tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage (80% threshold)
cd src-tauri && cargo test  # Run Rust tests
```

### Linting
```bash
npm run lint         # ESLint check
npm run lint:fix     # ESLint fix
npm run format       # Prettier format
npm run format:check # Prettier check
cd src-tauri && cargo clippy  # Rust linting
```

## Git Hooks

- **pre-commit**: Runs lint-staged (ESLint + Prettier on staged files)
- **pre-push**: Runs test coverage check (80% threshold) and Rust tests

## CI Pipeline

GitHub Actions runs on push/PR to main:
1. Frontend lint & format check
2. Frontend tests with coverage
3. Rust lint (Clippy) & format check
4. Rust tests
5. Build verification

## Code Conventions

### Frontend (TypeScript/React)
- Functional components with hooks
- ESLint flat config (eslint.config.js)
- Prettier for formatting
- Tests co-located with source (*.test.tsx)

### Backend (Rust)
- Tauri commands in `src-tauri/src/lib.rs`
- Tests in the same file using `#[cfg(test)]` module
- Clippy warnings treated as errors

## Coverage Requirements

Frontend code coverage threshold: **80%** (statements, branches, functions, lines)

Configured in `vitest.config.ts` and enforced via:
- Git pre-push hook
- CI pipeline
