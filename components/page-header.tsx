import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Breadcrumb = {
  label: string;
  href?: string;
};

export function PageHeader({
  title,
  subtitle,
  action,
  breadcrumbs
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {breadcrumbs?.length ? (
          <nav className="mb-3 flex max-w-full flex-wrap items-center gap-1 text-xs font-medium text-muted-foreground" aria-label="Percorso">
            {breadcrumbs.map((item, index) => (
              <span key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
                {index > 0 ? <ChevronRight className="h-3.5 w-3.5 shrink-0" /> : null}
                {item.href ? (
                  <Link href={item.href} className="truncate rounded-md hover:text-foreground">
                    {item.label}
                  </Link>
                ) : (
                  <span className="truncate text-foreground">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
