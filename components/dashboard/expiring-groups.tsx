"use client";

import { useEffect, useState } from "react";

import { ChevronRight } from "lucide-react";

import { supabase } from "@/lib/supabase";

const SLOTS = 7;

type Grupo = {
  id: string;
  nombre: string;
  correo: string;
  fecha_fin: string;
  miembros: number;
};

function daysUntil(dateStr: string): number {
  const diff =
    new Date(dateStr).getTime() -
    new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}


function statusBadge(days: number): {
  label: string;
  className: string;
} {
  if (days <= 7)
    return {
      label: "Atención",
      className:
        "bg-red-500/15 text-red-400 border border-red-500/20",
    };
  if (days <= 15)
    return {
      label: "Próximo a vencer",
      className:
        "bg-orange-500/15 text-orange-400 border border-orange-500/20",
    };
  return {
    label: "Próximo a vencer",
    className:
      "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  };
}

interface Props {
  onNavigate: (view: string) => void;
}

export function ExpiringGroups({ onNavigate }: Props) {
  const [groups, setGroups] = useState<Grupo[]>(
    []
  );

  useEffect(() => {
    const now = new Date();
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);

    supabase
      .from("grupos")
      .select("id, nombre, correo, fecha_fin, miembros")
      .gte("fecha_fin", now.toISOString())
      .lte("fecha_fin", in30.toISOString())
      .order("fecha_fin", { ascending: true })
      .limit(10)
      .then(({ data }) => {
        if (data) setGroups(data);
      });
  }, []);

  if (groups.length === 0) return null;

  return (
    <div
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
        backdrop-blur-xl
      "
    >
      <h2 className="mb-5 text-lg font-semibold">
        Grupos próximos a vencer
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs text-white/40">
            <th className="pb-3 font-normal">
              Grupo
            </th>

            <th className="pb-3 font-normal">
              Correo
            </th>

            <th className="pb-3 font-normal">
              Fin
            </th>

            <th className="pb-3 font-normal">
              Miembros
            </th>

            <th className="pb-3 font-normal">
              Estado
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/5">
          {groups.map((g) => {
            const days = daysUntil(g.fecha_fin);
            const miembros = g.miembros;
            const pct = Math.round(
              (miembros / SLOTS) * 100
            );
            const badge = statusBadge(days);

            return (
              <tr key={g.id}>
                <td className="py-3 font-medium">
                  {g.nombre}
                </td>

                <td className="py-3 text-white/50">
                  {g.correo}
                </td>

                <td className="py-3">
                  <span
                    className={`${days <= 7 ? "text-red-400" : "text-orange-400"}`}
                  >
                    {new Date(
                      g.fecha_fin
                    ).toLocaleDateString("es-MX")}{" "}
                    <span className="text-xs">
                      ({days} días)
                    </span>
                  </span>
                </td>

                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-white/50">
                      {miembros} / {SLOTS}
                    </span>

                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        onClick={() => onNavigate("Grupos")}
        className="mt-5 flex w-full items-center justify-center gap-1 text-sm text-white/40 transition hover:text-white/70"
      >
        Ver todos los grupos
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
