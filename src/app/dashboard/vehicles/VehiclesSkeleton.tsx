"use client";

import styles from "./vehicles.module.css";

export default function VehiclesSkeleton() {
  return (
    <div className={styles.tablePanel} role="status" aria-label="Carregando veículos">
      <div className="space-y-5 p-5" aria-hidden="true">
        <div className="h-4 w-40 rounded bg-syncar-surface-subtle" />
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex gap-6 border-t border-syncar-border pt-5">
            <div className="h-4 w-24 rounded bg-syncar-surface-subtle" />
            <div className="h-4 w-32 rounded bg-syncar-surface-subtle" />
            <div className="h-4 w-28 rounded bg-syncar-surface-subtle" />
          </div>
        ))}
      </div>
      <span className="sr-only">Carregando veículos</span>
    </div>
  );
}
