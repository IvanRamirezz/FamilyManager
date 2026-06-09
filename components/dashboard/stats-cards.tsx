"use client";

import { useEffect, useState } from "react";

import {
  Users,
  UserCheck,
  DollarSign,
  Calendar,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

const PRICE_PER_ACCOUNT = 220;
const SUBSCRIPTION_COST = 1150;

export function StatsCards() {
  const [total, setTotal] = useState<number | null>(null);
  const [totalUsuarios, setTotalUsuarios] = useState<number | null>(null);
  const [expiring, setExpiring] = useState<number | null>(null);
  const [newMonth, setNewMonth] = useState<number | null>(null);
  const [newMonthUsuarios, setNewMonthUsuarios] = useState<number>(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);

    const [
      { count: t },
      { data: sumData },
      { count: exp },
      { count: nm },
      { data: monthData },
    ] = await Promise.all([
      supabase.from("grupos").select("*", { count: "exact", head: true }),
      supabase.from("grupos").select("miembros"),
      supabase
        .from("grupos")
        .select("*", { count: "exact", head: true })
        .gte("fecha_fin", now.toISOString())
        .lte("fecha_fin", in30.toISOString()),
      supabase
        .from("grupos")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthStart.toISOString()),
      supabase
        .from("grupos")
        .select("miembros")
        .gte("created_at", monthStart.toISOString()),
    ]);

    setTotal(t ?? 0);
    setTotalUsuarios(
      sumData
        ? (sumData as { miembros: number }[]).reduce((acc, g) => acc + (g.miembros ?? 0), 0)
        : 0
    );
    setExpiring(exp ?? 0);
    setNewMonth(nm ?? 0);
    setNewMonthUsuarios(
      monthData
        ? (monthData as { miembros: number }[]).reduce((acc, g) => acc + (g.miembros ?? 0), 0)
        : 0
    );
  };

  const grupos = total ?? 0;
  const usuarios = totalUsuarios ?? 0;
  const exp = expiring ?? 0;
  const nm = newMonth ?? 0;

  // Ingresos reales: cada usuario paga $220; cada grupo cuesta $1150 de suscripción
  const totalGanancia = (usuarios * PRICE_PER_ACCOUNT) - (grupos * SUBSCRIPTION_COST);
  // Mensual: miembros reales de grupos creados este mes × $220 − costo de esos grupos
  const mensualGanancia = (newMonthUsuarios * PRICE_PER_ACCOUNT) - (nm * SUBSCRIPTION_COST);

  const cards = [
    {
      icon: Users,
      iconBg: "bg-[#134B5F]",
      iconColor: "text-[#A8DADC]",
      label: "Grupos activos",
      value: total === null ? "…" : String(grupos),
      trend: total === null ? "" : `+${nm} este mes`,
      trendGreen: true,
      subtitle: null,
    },
    {
      icon: UserCheck,
      iconBg: "bg-purple-900/60",
      iconColor: "text-purple-400",
      label: "Usuarios",
      value: totalUsuarios === null ? "…" : String(usuarios),
      trend: total === null ? "" : `+${nm} grupos este mes`,
      trendGreen: true,
      subtitle: null,
    },
    {
      icon: DollarSign,
      iconBg: "bg-emerald-900/60",
      iconColor: "text-emerald-400",
      label: "Ganancias totales",
      value:
        total === null
          ? "…"
          : `$${totalGanancia.toLocaleString("es-MX")}`,
      trend:
        total === null
          ? ""
          : mensualGanancia === 0
            ? "$0 este mes"
            : `${mensualGanancia > 0 ? "+" : ""}$${mensualGanancia.toLocaleString("es-MX")} este mes`,
      trendGreen: mensualGanancia >= 0,
      subtitle: null,
    },
    {
      icon: Calendar,
      iconBg: "bg-orange-900/60",
      iconColor: "text-orange-400",
      label: "Por vencer",
      value: expiring === null ? "…" : String(exp),
      trend:
        expiring === null
          ? ""
          : exp === 0
            ? "Todo al día"
            : `${exp} próximos`,
      trendGreen: exp === 0,
      subtitle: null,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/50">{card.label}</p>
                <h3 className="mt-2 text-4xl font-bold">{card.value}</h3>
              </div>

              <div className={`rounded-2xl p-3 ${card.iconBg}`}>
                <Icon size={22} className={card.iconColor} />
              </div>
            </div>

            {card.trend && (
              <p
                className={`mt-3 flex items-center gap-1.5 text-xs ${card.trendGreen ? "text-emerald-400" : "text-orange-400"}`}
              >
                {card.trend}
                <span
                  className={`h-2 w-2 rounded-full ${card.trendGreen ? "bg-emerald-400" : "bg-orange-400"}`}
                />
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
