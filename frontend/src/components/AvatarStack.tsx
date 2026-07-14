import { Avatar } from "@/components/ui/avatar";

export function AvatarStack({ names }: { names: string[] }) {
  const shown = names.slice(0, 4);
  const overflow = names.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((name, i) => (
        <Avatar key={i} name={name} className="h-6 w-6 border-2 border-surface text-[9px]" />
      ))}
      {overflow > 0 && (
        <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-canvas text-[9px] font-medium text-muted">
          +{overflow}
        </span>
      )}
    </div>
  );
}
