import type { Metric } from 'web-vitals';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

type IVitalMetric =
  | (Metric & { type: 'web-vital' })
  | {
      type: 'longtask';
      name: string;
      startTime: number;
      duration: number;
      attribution?: Record<string, unknown>;
    };

type IReporter = (metric: IVitalMetric) => void;

const defaultReporter: IReporter = (metric) => {
  const label = metric.type === 'web-vital' ? metric.name : 'longtask';
  console.info('[performance]', label, metric);
};

let hasStarted = false;
let longTaskObserver: PerformanceObserver | null = null;

export const start = (reporter: IReporter = defaultReporter) => {
  if (hasStarted || typeof window === 'undefined') return;
  hasStarted = true;

  const report = (metric: Metric) => {
    reporter({ ...metric, type: 'web-vital' });
  };

  onCLS(report, { reportAllChanges: true });
  onFCP(report);
  onINP(report, { reportAllChanges: true });
  onLCP(report, { reportAllChanges: true });
  onTTFB(report);

  if (
    'PerformanceObserver' in window &&
    Array.isArray((PerformanceObserver as any).supportedEntryTypes) &&
    (PerformanceObserver as any).supportedEntryTypes.includes('longtask')
  ) {
    longTaskObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        reporter({
          type: 'longtask',
          name: entry.name || 'longtask',
          startTime: entry.startTime,
          duration: entry.duration,
          attribution: (entry as any).attribution,
        });
      }
    });

    try {
      longTaskObserver.observe({ type: 'longtask', buffered: true });
    } catch (error) {
      console.warn('[performance] longtask observer failed:', error);
    }
  }
};

export const stop = () => {
  if (!hasStarted) return;

  if (longTaskObserver) {
    try {
      longTaskObserver.disconnect();
    } catch {}
    longTaskObserver = null;
  }

  hasStarted = false;
};
