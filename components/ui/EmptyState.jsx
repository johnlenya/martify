import { PackageOpen } from 'lucide-react';
import Link from 'next/link';

export default function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  actionHref,
  children,
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sand text-ink/40">
        <Icon className="h-6 w-6" strokeWidth={1.6} />
      </span>
      <h2 className="mt-5 font-display text-[20px] font-bold tracking-[-0.035em]">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="btn btn-primary mt-6">
          {actionLabel}
        </Link>
      ) : null}
      {children}
    </div>
  );
}
