"use client";

import { useEffect, useState } from "react";

import { Check, X } from "lucide-react";

import { supabase } from "@/lib/supabase";

import {
  ApproveModal,
  type SolicitudParaAprobar,
} from "./approve-modal";

type Solicitud = {
  id: string;
  nombre: string;
  whatsapp: string;
  usuario_nintendo: string;
  correo: string;
  comentarios: string | null;
  estado: string;
  created_at: string;
};

const estadoBadge: Record<string, string> = {
  pendiente:
    "bg-yellow-500/15 text-yellow-400",
  aprobada:
    "bg-emerald-500/15 text-emerald-400",
  rechazada: "bg-red-500/15 text-red-400",
};

export function SolicitudesTable() {
  const [solicitudes, setSolicitudes] =
    useState<Solicitud[]>([]);

  const [approving, setApproving] =
    useState<SolicitudParaAprobar | null>(null);

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    const { data, error } = await supabase
      .from("solicitudes")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      return;
    }

    setSolicitudes(data ?? []);
  };

  const reject = async (id: string) => {
    if (!confirm("¿Rechazar esta solicitud?"))
      return;

    const { error } = await supabase
      .from("solicitudes")
      .update({ estado: "rechazada" })
      .eq("id", id);

    if (!error) fetchSolicitudes();
  };

  return (
    <>
      {approving && (
        <ApproveModal
          solicitud={approving}
          onClose={() => setApproving(null)}
          onApproved={() => {
            setApproving(null);
            fetchSolicitudes();
          }}
        />
      )}

      <div
        className="
          mt-8
          rounded-3xl
          border
          border-white/10
          bg-white/5
          p-6
          backdrop-blur-xl
        "
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            Solicitudes
          </h2>

          <span className="text-sm text-white/50">
            {solicitudes.length} solicitudes
          </span>
        </div>

        <div className="space-y-4">
          {solicitudes.length === 0 && (
            <p className="py-10 text-center text-white/30">
              No hay solicitudes aún.
            </p>
          )}

          {solicitudes.map((s) => (
            <div
              key={s.id}
              className="
                flex
                items-center
                justify-between
                rounded-2xl
                border
                border-white/5
                bg-white/5
                px-5
                py-5
              "
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-medium">
                    {s.nombre}
                  </h3>

                  <span
                    className={`
                      rounded-full
                      px-3
                      py-0.5
                      text-xs
                      font-medium
                      ${estadoBadge[s.estado] ?? "bg-white/10 text-white/50"}
                    `}
                  >
                    {s.estado}
                  </span>
                </div>

                <p className="mt-1 text-sm text-white/50">
                  {s.whatsapp} ·{" "}
                  {s.usuario_nintendo}
                </p>

                <p className="text-sm text-white/40">
                  {s.correo}
                </p>

                {s.comentarios && (
                  <p className="mt-1 text-sm italic text-white/30">
                    {s.comentarios}
                  </p>
                )}
              </div>

              <div className="ml-4 flex shrink-0 items-center gap-3">
                <span className="text-xs text-white/30">
                  {new Date(
                    s.created_at
                  ).toLocaleDateString()}
                </span>

                {s.estado === "pendiente" && (
                  <>
                    <button
                      onClick={() =>
                        setApproving({
                          id: s.id,
                          nombre: s.nombre,
                          whatsapp: s.whatsapp,
                          usuario_nintendo:
                            s.usuario_nintendo,
                          correo: s.correo,
                        })
                      }
                      className="
                        rounded-xl
                        bg-emerald-500/10
                        p-3
                        text-emerald-400
                        transition
                        hover:bg-emerald-500/20
                      "
                    >
                      <Check size={18} />
                    </button>

                    <button
                      onClick={() =>
                        reject(s.id)
                      }
                      className="
                        rounded-xl
                        bg-red-500/10
                        p-3
                        text-red-400
                        transition
                        hover:bg-red-500/20
                      "
                    >
                      <X size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
