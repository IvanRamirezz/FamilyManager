"use client";

import {
  Home,
  Users,
  ClipboardList,
  FileText,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

const items = [
  { name: "Dashboard", icon: Home },
  { name: "Grupos", icon: Users },
  { name: "Formularios", icon: FileText },
  { name: "Solicitudes", icon: ClipboardList },
];

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export function Sidebar({
  activeView,
  onNavigate,
}: SidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <aside
      className="
        w-72
        border-r
        border-white/10
        bg-white/5
        backdrop-blur-xl
        p-6
        flex
        flex-col
      "
    >
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-[#A8DADC]">
          Family Manager
        </h2>

        <p className="mt-1 text-sm text-white/50">
          Nintendo Groups
        </p>
      </div>

      <nav className="space-y-2 flex-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeView === item.name;

          return (
            <button
              key={item.name}
              onClick={() =>
                onNavigate(item.name)
              }
              className={`
                flex
                w-full
                items-center
                gap-3
                rounded-2xl
                px-4
                py-3
                transition
                ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <Icon size={20} />
              {item.name}
            </button>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="
          flex
          w-full
          items-center
          gap-3
          rounded-2xl
          px-4
          py-3
          text-white/50
          transition
          hover:bg-white/10
          hover:text-white/80
        "
      >
        <LogOut size={20} />
        Cerrar sesión
      </button>
    </aside>
  );
}
