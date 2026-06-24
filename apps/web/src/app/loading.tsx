export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-200 border-t-primary-600" />
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
