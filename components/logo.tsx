import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("flex min-w-0 items-center gap-3", className)}>
      <Image
        src="/tmatic-logo.png"
        alt="T-Matic"
        width={48}
        height={48}
        priority
        className="h-10 w-10 shrink-0 object-contain"
      />
      {!compact ? (
        <span className="truncate text-xl font-black tracking-normal text-primary sm:text-2xl">
          T-Matic: Thematic Analysis Tool
        </span>
      ) : null}
    </Link>
  );
}
