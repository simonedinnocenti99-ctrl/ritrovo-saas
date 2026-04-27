import { initials } from "@/lib/utils";

export function MemberAvatarGroup({ names }: { names: string[] }) {
  const visible = names.slice(0, 4);
  return (
    <div className="flex -space-x-2">
      {visible.map((name) => (
        <span key={name} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-secondary text-xs font-semibold text-secondary-foreground">
          {initials(name)}
        </span>
      ))}
      {names.length > visible.length ? (
        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-muted text-xs font-semibold">
          +{names.length - visible.length}
        </span>
      ) : null}
    </div>
  );
}
