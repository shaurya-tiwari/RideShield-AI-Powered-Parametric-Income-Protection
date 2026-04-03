export function SkeletonBlock({ className = "" }) {
  return <div className={`animate-skeleton rounded-lg bg-surface-container-high ${className}`} />;
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock key={i} className={i === lines - 1 ? "w-3/4" : "w-full"} />
      ))}
    </div>
  );
}

export default function Skeleton({ className = "" }) {
  return <div className={`animate-skeleton rounded bg-surface-container-high ${className}`} />;
}
