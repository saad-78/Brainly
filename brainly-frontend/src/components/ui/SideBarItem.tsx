import type { ReactElement } from "react";

export function SidebarItem({ text, icon }: { text: string; icon: ReactElement }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 text-zinc-400 rounded-lg transition-all duration-200 hover:text-white hover:bg-zinc-800/40">
      <div className="text-lg flex-shrink-0">
        {icon}
      </div>
      <div className="font-medium text-sm truncate">
        {text}
      </div>
    </div>
  );
}
