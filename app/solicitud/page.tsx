"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

// ── Types (must match formularios-view.tsx) ──────

type FieldType =
  | "Texto corto"
  | "Texto largo"
  | "Número de teléfono"
  | "Correo"
  | "Opciones múltiples";

type Field = {
  id: string;
  iconName: string;
  label: string;
  titulo: string;
  type: FieldType;
  required: boolean;
  options?: string[];
};

// Maps field id → solicitudes DB column; unmapped fields go to comentarios as text
const DB_COLUMN: Record<string, string> = {
  "1": "nombre",
  "2": "whatsapp",
  "3": "usuario_nintendo",
  "4": "correo",
};

const STORAGE_KEY = "fm_form_fields";

const DEFAULT_FIELDS: Field[] = [
  { id: "1", iconName: "User",  label: "Nombre completo",     titulo: "¿Cuál es tu nombre completo?",                                                type: "Texto corto",        required: true  },
  { id: "2", iconName: "Phone", label: "WhatsApp",            titulo: "Escribe tu número de WhatsApp para agregarte al grupo y tener contacto contigo", type: "Número de teléfono", required: true  },
  { id: "3", iconName: "User",  label: "Usuario de Nintendo", titulo: "Escribe el nombre de usuario de tu cuenta Nintendo",                           type: "Texto corto",        required: true  },
  { id: "4", iconName: "Mail",  label: "Correo electrónico",  titulo: "Escribe tu correo vinculado a tu cuenta Nintendo",                             type: "Correo",             required: true  },
  { id: "5", iconName: "List",  label: "Grupo Familiar",      titulo: "¿Has estado anteriormente en una familia de Nintendo Switch Online?",          type: "Opciones múltiples", required: true,  options: ["Sí", "No"] },
  { id: "6", iconName: "List",  label: "Tiempo en familia",   titulo: "¿Cuánto tiempo tiene que saliste de esa familia?",                             type: "Opciones múltiples", required: false, options: ["Menos de 1 semana", "Más de 1 mes", "Más de 3 meses", "Más de 1 año"] },
];

export default function SolicitudPage() {
  const [fields, setFields] = useState<Field[]>(DEFAULT_FIELDS);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFields(JSON.parse(stored));
    } catch {
      // use defaults
    }
  }, []);

  const set = (id: string, val: string) =>
    setValues((prev) => ({ ...prev, [id]: val }));

  const handleSubmit = async () => {
    // Validate required fields
    const missing = fields.filter((f) => f.required && !values[f.id]?.trim());
    if (missing.length > 0) {
      alert(`Por favor completa: ${missing.map((f) => f.titulo || f.label).join(", ")}`);
      return;
    }

    setLoading(true);

    // Build DB row — known fields map directly, extras append to comentarios
    const row: Record<string, string | null> = {
      nombre: null,
      whatsapp: null,
      usuario_nintendo: null,
      correo: null,
      comentarios: null,
      estado: "pendiente",
    };

    const extras: string[] = [];

    for (const field of fields) {
      const val = values[field.id]?.trim() ?? null;
      const col = DB_COLUMN[field.id];
      if (col) {
        row[col] = val;
      } else if (val) {
        extras.push(`${field.titulo || field.label}: ${val}`);
      }
    }

    if (extras.length > 0) {
      row.comentarios = [row.comentarios, ...extras].filter(Boolean).join("\n");
    }

    const { error } = await supabase.from("solicitudes").insert(row);

    if (error) {
      setLoading(false);
      console.error(error);
      alert("Error al enviar la solicitud");
      return;
    }

    // Build Telegram message
    const lines: string[] = ["🎮 <b>Nueva solicitud recibida</b>\n"];
    for (const field of fields) {
      const val = values[field.id]?.trim();
      if (val) lines.push(`<b>${field.label}:</b> ${val}`);
    }
    await fetch("/api/notify-telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: lines.join("\n"),
        email: row.correo ?? "",
        whatsapp: row.whatsapp ?? "",
        nombre: row.nombre ?? "",
      }),
    }).catch(() => {}); // non-blocking — don't fail the form si Telegram falla

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071E26] p-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl">
          <div className="mb-4 text-5xl">🎮</div>
          <h2 className="text-2xl font-bold">¡Solicitud enviada!</h2>
          <p className="mt-3 text-white/50">
            Revisaremos tu solicitud y te contactaremos por WhatsApp para confirmar tu lugar.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#071E26] p-6 text-white">
      <div className="mx-auto w-full max-w-xl">

        {/* ── Header card ── */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 px-7 py-6 backdrop-blur-xl">
          <h1 className="text-lg font-bold text-[#A8DADC]">
            ⭐ Nintendo Switch Online + Paquete de Expansión
          </h1>
          <p className="mt-1 text-sm text-white/70">
            ¡Bienvenid@! 🎮 Completa este formulario para solicitar un lugar en uno de nuestros grupos familiares.
          </p>

          {/* Steps row */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-white/70">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-2 py-2.5">
              <div className="text-base">✅</div>
              <div className="mt-0.5">Verificamos tu info</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-2 py-2.5">
              <div className="text-base">👥</div>
              <div className="mt-0.5">Te asignamos un espacio</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-2 py-2.5">
              <div className="text-base">📩</div>
              <div className="mt-0.5">Enviamos instrucciones</div>
            </div>
          </div>

          {/* Benefits grid */}
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-white/40">¿Qué incluye?</p>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-white/70">
            <span>🌎 Juego en línea</span>
            <span>🎮 N64 · GB · GBA · NES · SNES · SEGA</span>
            <span>🎁 Contenido adicional</span>
            <span>☁️ Guardado en la nube</span>
            <span>🎵 Nintendo Music</span>
            <span className="text-white/40 text-[10px] self-center">Nintendo Switch 2:</span>
            <span>✨ Sin costo extra</span>
            <span>🧩 GameCube</span>
            <span>🛡️ Paquetes de mejora</span>
            <span>💬 Game Chat</span>
          </div>

          <div className="mt-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">
            ⚠️ <span className="font-semibold">Importante:</span> Ingresa correctamente el correo vinculado a tu cuenta Nintendo para evitar retrasos.
          </div>
        </div>

        {/* ── Form card ── */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <h2 className="mb-6 text-xl font-semibold">Solicitar un lugar</h2>

          <div className="space-y-5">
            {fields.map((field) => {
              const title = field.titulo || field.label;
              const val = values[field.id] ?? "";

              return (
                <div key={field.id} className="space-y-2">
                  <label className="block text-sm text-white/80">
                    {title}
                    {field.required && <span className="ml-1 text-red-400">*</span>}
                  </label>

                  {field.type === "Opciones múltiples" ? (
                    <div className="space-y-2 pl-1">
                      {(field.options ?? ["Sí", "No"]).map((opt) => (
                        <label key={opt} className="flex cursor-pointer items-center gap-2.5 text-sm text-white/70">
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full border transition ${
                              val === opt ? "border-[#2B6C84] bg-[#2B6C84]" : "border-white/30"
                            }`}
                            onClick={() => set(field.id, opt)}
                          >
                            {val === opt && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </span>
                          <span onClick={() => set(field.id, opt)}>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : field.type === "Texto largo" ? (
                    <textarea
                      value={val}
                      onChange={(e) => set(field.id, e.target.value)}
                      rows={3}
                      placeholder="Tu respuesta"
                      className="w-full resize-none rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
                    />
                  ) : (
                    <input
                      value={val}
                      onChange={(e) => set(field.id, e.target.value)}
                      type={field.type === "Correo" ? "email" : field.type === "Número de teléfono" ? "tel" : "text"}
                      placeholder="Tu respuesta"
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
                    />
                  )}
                </div>
              );
            })}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-2xl bg-[#2B6C84] px-5 py-3 font-medium transition hover:bg-[#34819d] disabled:opacity-50"
            >
              {loading ? "Enviando…" : "Enviar solicitud"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
