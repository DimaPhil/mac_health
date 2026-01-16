import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSystemStore } from "./store/systemStore";
import { updateTrayStatus } from "./lib/tauri";
import { Dashboard } from "./features/dashboard";
import { MemoryDetail } from "./features/memory";
import { StorageDetail } from "./features/storage";
import { BatteryDetail } from "./features/battery";
import { CpuDetail } from "./features/cpu";
import { SetupWizard } from "./features/setup";

const SETUP_COMPLETE_KEY = "mac-health-setup-complete";

// Animation variants for slide transitions
const slideVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

function ViewContainer() {
  const currentView = useSystemStore((s) => s.currentView);
  const previousView = useSystemStore((s) => s.previousView);

  // Direction: 1 = forward (into detail), -1 = backward (to dashboard)
  const direction = previousView === "dashboard" ? 1 : -1;

  return (
    <div className="w-full h-full overflow-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentView}
          custom={direction}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full h-full"
        >
          {currentView === "dashboard" && <Dashboard />}
          {currentView === "memory" && <MemoryDetail />}
          {currentView === "storage" && <StorageDetail />}
          {currentView === "battery" && <BatteryDetail />}
          {currentView === "cpu" && <CpuDetail />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function App() {
  const refreshAll = useSystemStore((s) => s.refreshAll);
  const overallStatus = useSystemStore((s) => s.overallStatus);
  const prevStatusRef = useRef(overallStatus);
  const [showSetup, setShowSetup] = useState(() => {
    return !localStorage.getItem(SETUP_COMPLETE_KEY);
  });

  const handleSetupComplete = () => {
    localStorage.setItem(SETUP_COMPLETE_KEY, "true");
    setShowSetup(false);
  };

  // Initial data fetch and polling (only when not in setup)
  useEffect(() => {
    if (showSetup) return;

    refreshAll();
    const interval = setInterval(refreshAll, 3000);
    return () => clearInterval(interval);
  }, [refreshAll, showSetup]);

  // Update tray icon when status changes
  useEffect(() => {
    if (showSetup) return;
    if (overallStatus !== prevStatusRef.current) {
      prevStatusRef.current = overallStatus;
      updateTrayStatus(overallStatus).catch(console.error);
    }
  }, [overallStatus, showSetup]);

  // Click-outside-to-dismiss behavior
  useEffect(() => {
    const appWindow = getCurrentWindow();
    const unlisten = appWindow.onFocusChanged(({ payload: focused }) => {
      if (!focused) {
        appWindow.hide();
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  if (showSetup) {
    return (
      <main className="w-full h-screen bg-surface">
        <SetupWizard onComplete={handleSetupComplete} />
      </main>
    );
  }

  return (
    <main className="w-full h-screen bg-surface">
      <ViewContainer />
    </main>
  );
}

export default App;
