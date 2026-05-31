type EmptyStateProps = {
  title: string;
  description: string;
  icon?: string;
};

export function EmptyState({ title, description, icon = "🔎" }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 px-6 py-14 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100 text-3xl dark:bg-slate-800">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}
