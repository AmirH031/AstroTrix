import React, { Suspense, memo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import IntroPage from "@/components/IntroPage";
import {
  LoadingSpinner,
  OmnitrixAnimation,
  AnalyticsPage,
  SettingsPage,
  ArchivePage,
  NotificationSettings
} from "@/components/UIComponents";

const NotesPage = React.lazy(() => import("@/components/NotesPage"));

const ErrorFallback = memo(({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
    <div className="text-center p-8 max-w-md">
      <div className="text-6xl mb-4">🛸</div>
      <h2 className="text-2xl font-bold mb-4 text-emerald-400">
        Alien Interference Detected
      </h2>
      <p className="text-slate-300 mb-6">
        Something went wrong with the alien technology. Let's try to recalibrate.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Recalibrate System
      </button>
    </div>
  </div>
));

const BackgroundVideo = memo(({ isDarkTheme }) => (
  <video
    autoPlay
    muted
    loop
    playsInline
    preload="metadata"
    className="fixed inset-0 w-full h-full object-cover -z-10 will-change-transform"
    poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='%23000' width='1' height='1'/%3E%3C/svg%3E"
    style={{
      filter: isDarkTheme
        ? "brightness(0.5) contrast(1.3) saturate(1.3)"
        : "brightness(0.3) contrast(0.6) saturate(0.5) opacity(0.4)",
    }}
  >
    <source src="/AstroTrix/Background.webm" type="video/webm" />
  </video>
));

BackgroundVideo.displayName = "BackgroundVideo";

const App = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleStart = () => {
    setShowIntro(false);
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 3000); // ⏱️ 3 seconds of animation
  };

  return (
    <div className="app-container dark">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <BackgroundVideo isDarkTheme />
        <Suspense fallback={<LoadingSpinner />}>
          {showIntro ? (
            <IntroPage onStart={handleStart} />
          ) : showAnimation ? (
            <OmnitrixAnimation />
          ) : (
            <NotesPage />
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default memo(App);