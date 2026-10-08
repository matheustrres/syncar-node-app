export default function MaintenanceSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-[var(--syncar-border)] bg-[var(--syncar-surface)]" aria-label="Carregando manutenções" role="status">
      <div className="h-12 border-b border-[var(--syncar-border)] bg-[var(--syncar-surface-subtle)]" />
      <div className="space-y-0 px-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="grid grid-cols-4 gap-5 border-b border-[var(--syncar-border)] py-5 last:border-0">
            {Array.from({ length: 4 }, (_, cell) => (
              <div key={cell} className="h-4 rounded bg-[var(--syncar-surface-subtle)]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
