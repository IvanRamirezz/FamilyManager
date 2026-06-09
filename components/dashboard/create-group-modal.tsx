"use client";

import { useEffect, useState } from "react";

import {
  Mail,
  Lock,
  Calendar,
  Users,
  Save,
  Info,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import {
  normalizeEmail,
  findAvailableVariant,
} from "@/lib/email-generator";

const SLOTS = 7;

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function addOneYear(date: string): string {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
}

function generatePassword(): string {
  const chars =
    "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from(
    { length: 12 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// ── Row layout helper ──────────────────────────

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-center gap-4 border-b border-white/5 py-4">
      <span className="text-sm text-white/50">
        {label}
      </span>
      <div>{children}</div>
    </div>
  );
}

// ── Component ──────────────────────────────────

type GenerateMode = "auto" | "manual";

export function CreateGroupModal() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [fechaInicio, setFechaInicio] =
    useState(today());
  const [fechaFin, setFechaFin] = useState(
    addOneYear(today())
  );
  const [showBaseInput, setShowBaseInput] =
    useState(false);
  const [generateMode, setGenerateMode] =
    useState<GenerateMode>("auto");
  const [baseEmail, setBaseEmail] = useState("");
  const [autoLoading, setAutoLoading] =
    useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNextName();
  }, []);

  // Sync fechaFin when fechaInicio changes
  useEffect(() => {
    if (fechaInicio) {
      setFechaFin(addOneYear(fechaInicio));
    }
  }, [fechaInicio]);

  const fetchNextName = async () => {
    const { count } = await supabase
      .from("grupos")
      .select("*", { count: "exact", head: true });
    setNombre(`Grupo #${(count ?? 0) + 1}`);
  };

  // Auto: tries every normalized email in DB, returns first free variant
  const autoGenerateEmail = async () => {
    setAutoLoading(true);

    const { data, error } = await supabase
      .from("grupos")
      .select("correo, correo_normalizado");

    setAutoLoading(false);

    if (error) { console.error(error); return; }
    if (!data || data.length === 0) {
      alert("No hay correos en la base de datos para generar variantes");
      return;
    }

    // Group used variants by normalized email
    const byNorm = new Map<string, string[]>();
    for (const row of data) {
      const key = row.correo_normalizado as string;
      if (!byNorm.has(key)) byNorm.set(key, []);
      byNorm.get(key)!.push(row.correo as string);
    }

    // Find first available variant across all normalized emails
    for (const [norm, used] of byNorm) {
      const available = findAvailableVariant(norm, used);
      if (available) {
        setCorreo(available);
        setShowBaseInput(false);
        return;
      }
    }

    alert("No hay variantes disponibles en ningún correo registrado");
  };

  // Manual: generate variant for a specific base email
  const generateEmail = async () => {
    if (!baseEmail) return;

    const normalized = normalizeEmail(baseEmail);
    const { data, error } = await supabase
      .from("grupos")
      .select("correo")
      .eq("correo_normalizado", normalized);

    if (error) { console.error(error); return; }

    const used = data?.map((d) => d.correo) ?? [];
    const available = findAvailableVariant(normalized, used);

    if (!available) {
      alert("No hay variantes disponibles para ese correo");
      return;
    }

    setCorreo(available);
    setShowBaseInput(false);
    setBaseEmail("");
  };

  const handleSave = async () => {
    if (!nombre || !correo || !password) {
      alert("Completa todos los campos");
      return;
    }

    setLoading(true);

    const correoNormalizado = normalizeEmail(correo);

    const { data: existingNombre } = await supabase
      .from("grupos")
      .select("id")
      .eq("nombre", nombre)
      .maybeSingle();

    if (existingNombre) {
      alert("Ya existe un grupo con ese nombre");
      setLoading(false);
      return;
    }

    const { data: existingCorreo } = await supabase
      .from("grupos")
      .select("id")
      .eq("correo", correo)
      .maybeSingle();

    if (existingCorreo) {
      alert("Ese correo exacto ya existe");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("grupos")
      .insert({
        nombre,
        correo,
        correo_normalizado: correoNormalizado,
        password,
        fecha_inicio: new Date(fechaInicio).toISOString(),
        fecha_fin: new Date(fechaFin).toISOString(),
      });

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Error al crear grupo");
      return;
    }

    setCorreo("");
    setPassword("");
    fetchNextName();
    window.location.reload();
  };

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
      <h2 className="text-xl font-semibold">
        Crear nuevo grupo
      </h2>

      <p className="mt-1 mb-5 text-sm text-white/50">
        Genera automáticamente un correo y
        contraseña para un nuevo grupo.
      </p>

      {/* Info banner */}
      <div
        className="
          mb-5
          flex
          items-start
          gap-3
          rounded-2xl
          border
          border-[#A8DADC]/20
          bg-[#A8DADC]/5
          px-4
          py-3
        "
      >
        <Info
          size={16}
          className="mt-0.5 shrink-0 text-[#A8DADC]"
        />

        <p className="text-sm text-white/60">
          El correo y la contraseña se generarán
          automáticamente. Cada grupo admite hasta{" "}
          {SLOTS} miembros.
        </p>
      </div>

      {/* Fields */}
      <div className="divide-y divide-white/5">
        {/* Nombre */}
        <Row label="Grupo">
          <input
            value={nombre}
            onChange={(e) =>
              setNombre(e.target.value)
            }
            className="
              w-full
              rounded-xl
              border
              border-white/10
              bg-white/10
              px-4
              py-2.5
              text-sm
              text-white
              outline-none
              focus:border-white/30
            "
          />
        </Row>

        {/* Correo */}
        <Row label="Correo del grupo">
          <div className="flex gap-2">
            <input
              value={correo}
              onChange={(e) =>
                setCorreo(e.target.value)
              }
              placeholder="No generado"
              className="
                flex-1
                rounded-xl
                border
                border-white/10
                bg-white/10
                px-4
                py-2.5
                text-sm
                text-white
                placeholder:text-white/30
                outline-none
                focus:border-white/30
              "
            />

            <button
              onClick={() =>
                setShowBaseInput((v) => !v)
              }
              className="
                flex
                items-center
                gap-1.5
                rounded-xl
                bg-[#134B5F]
                px-4
                py-2.5
                text-sm
                transition
                hover:bg-[#1a6078]
                whitespace-nowrap
              "
            >
              <Mail size={14} />
              Generar correo
            </button>
          </div>

          {showBaseInput && (
            <div className="mt-3 space-y-3">
              {/* Mode tabs */}
              <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
                {(
                  [
                    { id: "auto", label: "⚡ Automático" },
                    { id: "manual", label: "✏️ Específico" },
                  ] as { id: GenerateMode; label: string }[]
                ).map((m) => (
                  <button
                    key={m.id}
                    onClick={() =>
                      setGenerateMode(m.id)
                    }
                    className={`
                      flex-1
                      rounded-lg
                      py-2
                      text-xs
                      font-medium
                      transition
                      ${
                        generateMode === m.id
                          ? "bg-[#2B6C84] text-white"
                          : "text-white/50 hover:text-white/80"
                      }
                    `}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Auto mode */}
              {generateMode === "auto" && (
                <div>
                  <p className="mb-2 text-xs text-white/40">
                    Busca la primera variante libre
                    entre todos los correos
                    registrados.
                  </p>

                  <button
                    onClick={autoGenerateEmail}
                    disabled={autoLoading}
                    className="
                      w-full
                      rounded-xl
                      bg-emerald-700
                      py-2.5
                      text-sm
                      transition
                      hover:bg-emerald-600
                      disabled:opacity-50
                    "
                  >
                    {autoLoading
                      ? "Buscando variante…"
                      : "Generar automáticamente"}
                  </button>
                </div>
              )}

              {/* Manual mode */}
              {generateMode === "manual" && (
                <div>
                  <p className="mb-2 text-xs text-white/40">
                    Ingresa el correo normalizado
                    (sin puntos) para generar la
                    siguiente variante disponible.
                  </p>

                  <div className="flex gap-2">
                    <input
                      autoFocus
                      placeholder="rmzivan510@gmail.com"
                      value={baseEmail}
                      onChange={(e) =>
                        setBaseEmail(e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          generateEmail();
                      }}
                      className="
                        flex-1
                        rounded-xl
                        border
                        border-white/10
                        bg-white/10
                        px-4
                        py-2.5
                        text-sm
                        text-white
                        placeholder:text-white/30
                        outline-none
                        focus:border-white/30
                      "
                    />

                    <button
                      onClick={generateEmail}
                      className="
                        rounded-xl
                        bg-emerald-700
                        px-4
                        py-2.5
                        text-sm
                        transition
                        hover:bg-emerald-600
                      "
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Row>

        {/* Password */}
        <Row label="Contraseña">
          <div className="flex gap-2">
            <input
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="No generada"
              className="
                flex-1
                rounded-xl
                border
                border-white/10
                bg-white/10
                px-4
                py-2.5
                text-sm
                text-white
                placeholder:text-white/30
                outline-none
                focus:border-white/30
              "
            />

            <button
              onClick={() =>
                setPassword(generatePassword())
              }
              className="
                flex
                items-center
                gap-1.5
                rounded-xl
                bg-[#134B5F]
                px-4
                py-2.5
                text-sm
                transition
                hover:bg-[#1a6078]
                whitespace-nowrap
              "
            >
              <Lock size={14} />
              Generar contraseña
            </button>
          </div>
        </Row>

        {/* Fecha inicio */}
        <Row label="Fecha de inicio">
          <div className="flex items-center gap-2">
            <Calendar
              size={15}
              className="text-white/40"
            />

            <input
              type="date"
              value={fechaInicio}
              onChange={(e) =>
                setFechaInicio(e.target.value)
              }
              className="
                rounded-xl
                border
                border-white/10
                bg-white/10
                px-4
                py-2.5
                text-sm
                text-white
                outline-none
                focus:border-white/30
                [color-scheme:dark]
              "
            />
          </div>
        </Row>

        {/* Fecha fin */}
        <Row label="Fecha de fin">
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Calendar
              size={15}
              className="text-white/30"
            />
            {fechaFin}
            <span className="text-xs text-white/30">
              (auto)
            </span>
          </div>
        </Row>

        {/* Espacios */}
        <Row label="Espacios disponibles">
          <div className="flex items-center gap-2 text-sm text-[#A8DADC]">
            <Users size={15} />
            {SLOTS} / {SLOTS} miembros
          </div>
        </Row>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="
          mt-5
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-2xl
          bg-[#2B6C84]
          py-3.5
          text-sm
          font-medium
          transition
          hover:bg-[#34819d]
          disabled:opacity-50
        "
      >
        <Save size={16} />
        {loading ? "Guardando…" : "Guardar grupo"}
      </button>
    </div>
  );
}
