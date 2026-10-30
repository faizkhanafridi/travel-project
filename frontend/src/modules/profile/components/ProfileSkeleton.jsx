export default function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex gap-4 items-center">
        <div className="h-24 w-24 rounded-full bg-ink-100" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-40 rounded bg-ink-100" />
          <div className="h-3 w-24 rounded bg-ink-100" />
        </div>
      </div>
      <div className="h-3 w-full rounded bg-ink-100" />
      <div className="h-3 w-4/5 rounded bg-ink-100" />
      <div className="h-3 w-2/3 rounded bg-ink-100" />
    </div>
  );
}