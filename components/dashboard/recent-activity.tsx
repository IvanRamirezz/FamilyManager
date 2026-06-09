"use client";

import { useEffect, useState } from "react";

import {
  Users,
  CheckCircle,
  Calendar,
  ChevronRight,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Grupo = {
  id: string;
  nombre: string;
  correo: string;
  fecha_fin: string;
  created_at: string;
};

function timeAgo(dateStr: string): {
  label: string;
  time: string;
} {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(
    diffMs / (1000 * 60 * 60 * 24)
  );

  const time = d.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffDays === 0) return { label: "Hoy", time };
  if (diffDays === 1)
    return { label: "Ayer", time };
  return {
    label: `${diffDays} Jun`,
    time,
  };
}

export function RecentActivity() {
  const [groups, setGroups] = useState<Grupo[]>(
    []
  );

  useEffect(() => {
    supabase
      .from("grupos")
      .select(
        "id, nombre, correo, fecha_fin, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setGroups(data);
      });
  }, []);

  const items = groups.map((g, i) => {
    const { label, time } = timeAgo(g.created_at);
    const types = [
      {
        icon: Users,
        bg: "bg-[#134B5F]",
        color: "text-[#A8DADC]",
        title: `${g.nombre} creado`,
        sub: g.correo,
      },
      {
        icon: CheckCircle,
        bg: "bg-emerald-900/60",
        color: "text-emerald-400",
        title: `${g.nombre} renovado`,
        sub: `Fin: ${new Date(g.fecha_fin).toLocaleDateString("es-MX")}`,
      },
      {
        icon: Calendar,
        bg: "bg-orange-900/60",
        color: "text-orange-400",
        title: `${g.nombre} por vencer`,
        sub: `Vence pronto`,
      },
    ];
    const t = types[i % 3];
    return { ...t, label, time, id: g.id };
  });

  return (
    <div
      className="
        h-full
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
        backdrop-blur-xl
      "
    >
      <h2 className="mb-5 text-lg font-semibold">
        Actividad reciente
      </h2>

      <div className="space-y-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="flex items-start gap-3"
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.bg}`}
              >
                <Icon
                  size={16}
                  className={item.color}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">
                  {item.title}
                </p>

                <p className="mt-0.5 truncate text-xs text-white/40">
                  {item.sub}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-xs text-white/40">
                  {item.label}
                </p>

                <p className="text-xs text-white/30">
                  {item.time}
                </p>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <p className="py-8 text-center text-sm text-white/30">
            No hay actividad aún.
          </p>
        )}
      </div>

      {items.length > 0 && (
        <button className="mt-5 flex w-full items-center justify-center gap-1 text-sm text-white/40 transition hover:text-white/70">
          Ver todas las actividades
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
