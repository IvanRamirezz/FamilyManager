"use client";

import { useEffect, useState } from "react";

import { X, MessageCircle } from "lucide-react";

import { supabase } from "@/lib/supabase";

type Grupo = {
  id: string;
  nombre: string;
  correo: string;
  password: string;
};

export type SolicitudParaAprobar = {
  id: string;
  nombre: string;
  whatsapp: string;
  usuario_nintendo: string;
  correo: string;
};

interface ApproveModalProps {
  solicitud: SolicitudParaAprobar;
  onClose: () => void;
  onApproved: () => void;
}

export function ApproveModal({
  solicitud,
  onClose,
  onApproved,
}: ApproveModalProps) {
  const [grupos, setGrupos] = useState<Grupo[]>(
    []
  );

  const [selectedId, setSelectedId] =
    useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("grupos")
      .select("id, nombre, correo, password")
      .order("nombre")
      .then(({ data }) => {
        if (data) setGrupos(data);
      });
  }, []);

  const grupo = grupos.find(
    (g) => g.id === selectedId
  );

  const mensaje = grupo
    ? `Hola ${solicitud.nombre}, tu solicitud para Nintendo Switch Online fue aprobada 🎮\n\n` +
      `Te asignamos al ${grupo.nombre}.\n` +
      `📧 Correo: ${grupo.correo}\n` +
      `🔑 Contraseña: ${grupo.password}\n\n` +
      `¡Bienvenido/a!`
    : "";

  const whatsappUrl = grupo
    ? `https://wa.me/52${solicitud.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}`
    : "";

  const handleApprove = async () => {
    if (!selectedId) return;

    setLoading(true);

    const { error } = await supabase
      .from("solicitudes")
      .update({
        estado: "aprobada",
        grupo_id: selectedId,
      })
      .eq("id", solicitud.id);

    setLoading(false);

    if (error) {
      console.error(error);
      return;
    }

    window.open(whatsappUrl, "_blank");
    onApproved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="
          w-full
          max-w-lg
          rounded-3xl
          border
          border-white/10
          bg-[#071E26]
          p-6
        "
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Aprobar solicitud
          </h2>

          <button
            onClick={onClose}
            className="
              rounded-xl
              bg-white/10
              p-2
              transition
              hover:bg-white/20
            "
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="
            mb-6
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-4
          "
        >
          <p className="font-medium">
            {solicitud.nombre}
          </p>

          <p className="mt-1 text-sm text-white/50">
            {solicitud.whatsapp} ·{" "}
            {solicitud.usuario_nintendo}
          </p>

          <p className="text-sm text-white/40">
            {solicitud.correo}
          </p>
        </div>

        <div className="mb-6 space-y-2">
          <p className="text-sm text-white/50">
            Asignar a grupo
          </p>

          <select
            value={selectedId}
            onChange={(e) =>
              setSelectedId(e.target.value)
            }
            className="
              w-full
              rounded-2xl
              border
              border-white/10
              bg-[#0d2d3d]
              px-4
              py-3
              text-white
              outline-none
              focus:border-white/30
            "
          >
            <option value="">
              Seleccionar grupo…
            </option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre} — {g.correo}
              </option>
            ))}
          </select>
        </div>

        {grupo && (
          <div
            className="
              mb-6
              rounded-2xl
              border
              border-emerald-500/20
              bg-emerald-500/10
              p-4
            "
          >
            <p className="mb-2 text-xs text-emerald-400">
              Mensaje de WhatsApp
            </p>

            <p className="whitespace-pre-wrap text-sm text-white/80">
              {mensaje}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="
              flex-1
              rounded-2xl
              border
              border-white/10
              bg-white/5
              py-3
              transition
              hover:bg-white/10
            "
          >
            Cancelar
          </button>

          <button
            onClick={handleApprove}
            disabled={!selectedId || loading}
            className="
              flex
              flex-1
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-emerald-700
              py-3
              transition
              hover:bg-emerald-600
              disabled:opacity-50
            "
          >
            <MessageCircle size={18} />
            {loading
              ? "Aprobando…"
              : "Aprobar y enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
