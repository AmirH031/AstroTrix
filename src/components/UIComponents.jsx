import { lazy, memo } from 'react';

// ---------- Lazy Loaded Pages ----------
export const AnalyticsPage = lazy(() => import('./AnalyticsPage'));
export const SettingsPage = lazy(() => import('./SettingsPage'));
export const ArchivePage = lazy(() => import('./ArchivePage'));
export const NotificationSettings = lazy(() => import('./NotificationSettings'));
export const OmnitrixAnimation = lazy(() => import('./OmnitrixAnimation'));

// ---------- Lazy Loaded Chart Components ----------
export const PieChart = lazy(() => import('recharts').then(m => ({ default: m.PieChart })));
export const ResponsiveContainer = lazy(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })));
export const Pie = lazy(() => import('recharts').then(m => ({ default: m.Pie })));
export const Cell = lazy(() => import('recharts').then(m => ({ default: m.Cell })));

// ---------- Loading Spinner ----------
const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

export const LoadingSpinner = memo(({ size = 'md', className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div
      className={`${sizeMap[size]} border-2 border-green-400 border-t-transparent rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';
