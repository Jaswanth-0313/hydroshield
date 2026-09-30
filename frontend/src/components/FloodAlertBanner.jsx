import React, { useEffect, useState } from 'react';
import { AlertTriangle, Bell, X, Waves, ShieldAlert } from 'lucide-react';

const ALERT_TYPES = {
  CRITICAL: {
    bg: 'bg-rose-950/95',
    border: 'border-rose-600',
    icon: AlertTriangle,
    iconColor: 'text-rose-400',
    labelColor: 'text-rose-300',
    pulse: 'animate-pulse',
  },
  HIGH: {
    bg: 'bg-orange-950/95',
    border: 'border-orange-600',
    icon: ShieldAlert,
    iconColor: 'text-orange-400',
    labelColor: 'text-orange-300',
    pulse: '',
  },
  INFO: {
    bg: 'bg-cyan-950/90',
    border: 'border-cyan-700',
    icon: Bell,
    iconColor: 'text-cyan-400',
    labelColor: 'text-cyan-300',
    pulse: '',
  },
};

export default function FloodAlertBanner({ alerts = [] }) {
  const [visibleAlerts, setVisibleAlerts] = useState([]);

  useEffect(() => {
    setVisibleAlerts(alerts.map((a, i) => ({ ...a, id: a.id || `alert-${i}`, dismissed: false })));
  }, [alerts]);

  const dismiss = (id) => {
    setVisibleAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a)));
  };

  const active = visibleAlerts.filter((a) => !a.dismissed);
  if (active.length === 0) return null;

  return (
    <div className="fixed top-[90px] right-4 z-40 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {active.slice(0, 4).map((alert) => {
        const cfg = ALERT_TYPES[alert.type] || ALERT_TYPES.INFO;
        const Icon = cfg.icon;
        return (
          <div
            key={alert.id}
            className={`${cfg.bg} ${cfg.border} border rounded-xl shadow-2xl p-3.5 flex items-start gap-3 pointer-events-auto backdrop-blur`}
          >
            <div className={`flex-shrink-0 mt-0.5 ${cfg.iconColor} ${cfg.pulse}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-bold uppercase tracking-wide ${cfg.labelColor}`}>
                {alert.type} — {alert.title}
              </div>
              <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">{alert.message}</div>
              {alert.time_min !== undefined && (
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  T + {alert.time_min} min
                </div>
              )}
            </div>
            <button
              onClick={() => dismiss(alert.id)}
              className="flex-shrink-0 text-slate-500 hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
