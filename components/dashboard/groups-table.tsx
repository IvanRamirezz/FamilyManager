"use client";

import { useEffect, useState } from "react";

import { useRef, useCallback } from "react";

import {
  Search,
  Pencil,
  Trash2,
  Eye,
  Plus,
  X,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  Copy,
  EyeOff,
  Check,
  ImageIcon,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { normalizeEmail } from "@/lib/email-generator";

// ── Constants ────────────────────────────────────

const SLOTS = 7;
const PAGE_SIZE = 10;

const AVATAR_COLORS = [
  "bg-purple-500",
  "bg-blue-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-cyan-600",
];

const AVATAR_LETTERS = [
  "J", "M", "C", "L", "A", "F", "R",
];

// ── Types ────────────────────────────────────────

type Grupo = {
  id: string;
  nombre: string;
  correo: string;
  password: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
  miembros: number;
};

// ── Helpers ──────────────────────────────────────

function barColor(pct: number): string {
  if (pct >= 75) return "bg-emerald-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-orange-600";
}

// ── Edit Group Modal ─────────────────────────────

function EditGroupModal({
  group,
  onClose,
  onSaved,
}: {
  group: Grupo;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [correo, setCorreo] = useState(group.correo);
  const [password, setPassword] = useState(group.password);
  const [showPass, setShowPass] = useState(false);
  const [date, setDate] = useState(group.fecha_inicio.split("T")[0]);
  const [miembros, setMiembros] = useState(group.miembros);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSave = async () => {
    if (!date || !correo || !password) return;
    setLoading(true);

    const fechaInicio = new Date(date);
    const fechaFin = new Date(date);
    fechaFin.setFullYear(fechaFin.getFullYear() + 1);

    const { error } = await supabase
      .from("grupos")
      .update({
        correo,
        correo_normalizado: normalizeEmail(correo),
        password,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        miembros,
      })
      .eq("id", group.id);

    setLoading(false);
    if (error) { console.error(error); return; }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#071E26] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{group.nombre}</h2>
          <button onClick={onClose} className="rounded-xl bg-white/10 p-2 transition hover:bg-white/20">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {/* Correo */}
          <div>
            <label className="mb-1 block text-xs text-white/40">Correo</label>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <input
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white outline-none"
              />
              <button onClick={() => copy(correo, "correo")} className="shrink-0 text-white/40 transition hover:text-white">
                {copied === "correo" ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
              </button>
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="mb-1 block text-xs text-white/40">Contraseña</label>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent font-mono text-sm text-white outline-none"
              />
              <button onClick={() => setShowPass((v) => !v)} className="shrink-0 text-white/40 transition hover:text-white">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button onClick={() => copy(password, "pass")} className="shrink-0 text-white/40 transition hover:text-white">
                {copied === "pass" ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
              </button>
            </div>
          </div>

          {/* Fecha inicio */}
          <div>
            <label className="mb-1 block text-xs text-white/40">
              Fecha de inicio <span className="text-white/25">(fin = inicio + 1 año)</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/30 scheme-dark"
            />
          </div>

          {/* Miembros */}
          <div>
            <label className="mb-2 block text-xs text-white/40">
              Miembros activos ({miembros}/{SLOTS})
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={SLOTS}
                value={miembros}
                onChange={(e) => setMiembros(Number(e.target.value))}
                className="flex-1 accent-[#2B6C84]"
              />
              <span className="w-6 text-center text-sm font-medium">{miembros}</span>
            </div>
            <div className="mt-2 flex gap-1.5">
              {Array.from({ length: SLOTS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${i < miembros ? barColor(Math.round((miembros / SLOTS) * 100)) : "bg-white/10"}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm transition hover:bg-white/10">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 rounded-2xl bg-[#2B6C84] py-3 text-sm transition hover:bg-[#34819d] disabled:opacity-50"
          >
            {loading ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Members Modal ────────────────────────────────

const MEMBER_COLORS = [
  "bg-pink-500",
  "bg-green-500",
  "bg-blue-400",
  "bg-lime-500",
  "bg-purple-500",
  "bg-orange-400",
  "bg-teal-500",
];

type Miembro = {
  id: string;
  usuario_nintendo: string;
};

function MemberCard({
  member,
  index,
  onRemove,
}: {
  member: Miembro;
  index: number;
  onRemove: (id: string) => void;
}) {
  const letter = (member.usuario_nintendo[0] ?? "?").toUpperCase();
  const color = MEMBER_COLORS[index % MEMBER_COLORS.length];

  return (
    <div className="group relative flex flex-col items-center rounded-2xl border border-white/5 bg-white/5 p-4 pb-3 text-center">
      <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white ${color}`}>
        {letter}
      </div>

      <p className="text-sm font-semibold leading-tight">{member.usuario_nintendo}</p>
      <p className="mt-0.5 text-xs text-white/40">Miembro del grupo</p>

      <button
        onClick={() => onRemove(member.id)}
        className="absolute right-2 top-2 hidden rounded-lg bg-red-500/10 p-1.5 text-red-400 transition hover:bg-red-500/20 group-hover:flex"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

function EmptySlot({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed py-6 text-center transition ${
        onClick
          ? "border-white/20 hover:border-white/40 hover:bg-white/5"
          : "cursor-default border-white/10"
      }`}
    >
      <div className={`mb-2 flex h-14 w-14 items-center justify-center rounded-full ${onClick ? "bg-white/10" : "bg-white/5"}`}>
        {onClick ? <Plus size={20} className="text-white/50" /> : null}
      </div>
      <p className="text-xs text-white/30">{onClick ? "Agregar miembro" : "Espacio disponible"}</p>
    </button>
  );
}

function MembersModal({
  group,
  onClose,
  onUpdated,
}: {
  group: Grupo;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [members, setMembers] = useState<Miembro[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  // Screenshot import state
  const [importing, setImporting] = useState(false);
  const [extracted, setExtracted] = useState<string[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const screenshotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("miembros_grupo")
      .select("*")
      .eq("grupo_id", group.id)
      .order("created_at");

    if (error) { console.error("fetchMembers:", error); return; }
    if (data) {
      // Support both old schema (nombre) and new schema (usuario_nintendo)
      const mapped: Miembro[] = (data as Record<string, unknown>[]).map((m) => ({
        id: m.id as string,
        usuario_nintendo: (m.usuario_nintendo as string) || (m.nombre as string) || "Sin nombre",
      }));
      setMembers(mapped);
    }
  };

  const addMember = async (u = username) => {
    if (!u.trim() || members.length >= SLOTS) return;
    setLoading(true);
    const { error } = await supabase.from("miembros_grupo").insert({
      grupo_id: group.id,
      nombre: u.trim(),           // satisfies NOT NULL constraint
      usuario_nintendo: u.trim(),
    });
    if (!error) {
      await supabase.from("grupos").update({ miembros: members.length + 1 }).eq("id", group.id);
    }
    setLoading(false);
    if (error) { console.error(error); return; }
    setUsername("");
    setShowAdd(false);
    fetchMembers();
    onUpdated();
  };

  const removeMember = async (id: string) => {
    if (!confirm("¿Eliminar este miembro?")) return;
    await supabase.from("miembros_grupo").delete().eq("id", id);
    await supabase.from("grupos").update({ miembros: Math.max(0, members.length - 1) }).eq("id", group.id);
    fetchMembers();
    onUpdated();
  };


  // Tokens that appear in Nintendo UI but are NOT usernames
  const NINTENDO_IGNORE = [
    /^administrador$/i,
    /^padre$/i,
    /^madre$/i,
    /^tutor$/i,
    /^miembro$/i,
    /^grupo$/i,
    /^familiar$/i,
    /^añadir$/i,
    /^agregar$/i,
    /^tú$/i,
    /^tu$/i,
    /^\(tú\)$/i,
    /^\(tu\)$/i,
    /^\(\d+\)$/,   // OCR misreads (tú) as (1)
    /^del$/i,
    /^un$/i,
    /^o$/i,
  ];

  const isLikelyUsername = useCallback((word: string) => {
    const t = word.trim();
    if (t.length < 2 || t.length > 25) return false;
    if (NINTENDO_IGNORE.some((p) => p.test(t))) return false;
    if (!/[a-zA-Z0-9]/.test(t)) return false;
    return true;
  }, []);

  const processScreenshot = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImporting(true);
    setExtracted(null);
    setImportError(null);

    try {
      const Tesseract = (await import("tesseract.js")).default;
      // Use word-level data so 2-column grid cells don't merge into one line
      const { data } = await Tesseract.recognize(file, "eng", {
        logger: () => {},
      });

      // Split by whitespace (word by word) to avoid 2-column grid merging
      const words: string[] = data.text
        .split(/\s+/)
        .map((w) => w.replace(/[()[\]{}|_\\,.!?]/g, "").trim())
        .filter(isLikelyUsername);

      const unique = [...new Set(words)];
      setExtracted(unique);
    } catch (err) {
      setImportError(String(err));
    } finally {
      setImporting(false);
    }
  };

  const confirmImport = async () => {
    if (!extracted) return;
    const available = SLOTS - members.length;
    const toAdd = extracted.slice(0, available);
    for (const u of toAdd) {
      await supabase.from("miembros_grupo").insert({
        grupo_id: group.id,
        nombre: u,
        usuario_nintendo: u,
      });
    }
    if (toAdd.length > 0) {
      await supabase.from("grupos").update({ miembros: members.length + toAdd.length }).eq("id", group.id);
    }
    setExtracted(null);
    fetchMembers();
    onUpdated();
  };

  // Build 7-slot grid
  const slots = Array.from({ length: SLOTS }, (_, i) => members[i] ?? null);
  const firstEmpty = slots.findIndex((s) => s === null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl border border-white/10 bg-[#071E26] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{group.nombre}</h2>
            <p className="text-xs text-white/40">{members.length}/{SLOTS} miembros</p>
          </div>
          <button onClick={onClose} className="rounded-xl bg-white/10 p-2 transition hover:bg-white/20">
            <X size={18} />
          </button>
        </div>

        {/* Screenshot import zone */}
        {extracted === null ? (
          <>
            <div
              className={`mb-1 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-4 text-center transition ${
                isDragging
                  ? "border-[#2B6C84] bg-[#2B6C84]/10"
                  : importError
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-white/10 hover:border-white/25 hover:bg-white/5"
              } ${importing ? "pointer-events-none opacity-60" : ""}`}
              onClick={() => { setImportError(null); screenshotRef.current?.click(); }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const f = e.dataTransfer.files[0];
                if (f) processScreenshot(f);
              }}
            >
              {importing ? (
                <p className="text-sm text-white/50">Analizando captura…</p>
              ) : importError ? (
                <>
                  <p className="text-sm text-red-400">Error: {importError}</p>
                  <p className="text-xs text-white/30">Haz clic para intentar de nuevo</p>
                </>
              ) : (
                <>
                  <ImageIcon size={20} className="text-white/30" />
                  <p className="text-sm text-white/50">
                    Arrastra o haz clic para importar captura del grupo Nintendo
                  </p>
                  <p className="text-xs text-white/25">Extrae usuarios automáticamente</p>
                </>
              )}
            </div>
            <div className="mb-3" />
          </>
        ) : (
          /* Extracted usernames confirmation */
          <div className="mb-4 rounded-2xl border border-[#2B6C84]/40 bg-[#2B6C84]/10 p-4">
            <p className="mb-3 text-sm font-medium text-[#A8DADC]">
              {extracted.length > 0
                ? `${extracted.length} usuario${extracted.length !== 1 ? "s" : ""} detectado${extracted.length !== 1 ? "s" : ""}:`
                : "No se encontraron usuarios en la imagen."}
            </p>
            {extracted.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {extracted.map((u, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm"
                  >
                    {u}
                    <button
                      onClick={() => setExtracted((prev) => prev!.filter((_, j) => j !== i))}
                      className="text-white/30 hover:text-white/70"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setExtracted(null)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-sm transition hover:bg-white/10"
              >
                Cancelar
              </button>
              {extracted.length > 0 && (
                <button
                  onClick={confirmImport}
                  className="flex-1 rounded-xl bg-[#2B6C84] py-2 text-sm transition hover:bg-[#34819d]"
                >
                  Agregar todos
                </button>
              )}
            </div>
          </div>
        )}

        <input
          ref={screenshotRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processScreenshot(f); }}
        />

        {/* Grid */}
        <div className="mb-4 grid flex-1 grid-cols-2 gap-3 overflow-y-auto">
          {slots.map((member, i) => {
            if (member) {
              return (
                <MemberCard
                  key={member.id}
                  member={member}
                  index={i}
                  onRemove={removeMember}
                />
              );
            }
            const isFirst = i === firstEmpty;
            return (
              <EmptySlot
                key={i}
                onClick={isFirst && !showAdd ? () => setShowAdd(true) : undefined}
              />
            );
          })}
        </div>

        {/* Inline add form */}
        {showAdd && (
          <div className="mb-3 flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
            <input
              autoFocus
              placeholder="Usuario de Nintendo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addMember(); if (e.key === "Escape") setShowAdd(false); }}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
            />
            <button onClick={() => setShowAdd(false)} className="rounded-lg px-2 text-white/40 transition hover:text-white">
              <X size={16} />
            </button>
            <button
              onClick={() => addMember()}
              disabled={!username.trim() || loading}
              className="rounded-xl bg-emerald-700 px-4 py-1.5 text-sm transition hover:bg-emerald-600 disabled:opacity-50"
            >
              {loading ? "…" : "Agregar"}
            </button>
          </div>
        )}

        <button onClick={onClose} className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-sm transition hover:bg-white/10">
          Cerrar
        </button>
      </div>
    </div>
  );
}


// ── Main component ───────────────────────────────

export function GroupsTable() {
  const [groups, setGroups] = useState<Grupo[]>(
    []
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [membersGroup, setMembersGroup] =
    useState<Grupo | null>(null);
  const [editGroup, setEditGroup] =
    useState<Grupo | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from("grupos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }
    setGroups(data ?? []);
  };

  const deleteGroup = async (id: string) => {
    if (!confirm("¿Eliminar grupo?")) return;

    const { error } = await supabase
      .from("grupos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }
    setGroups((prev) =>
      prev.filter((g) => g.id !== id)
    );
  };


  // Filtering + pagination
  const filtered = groups.filter((g) => {
    const q = search.toLowerCase();
    return (
      g.correo.toLowerCase().includes(q) ||
      g.nombre.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const goTo = (p: number) =>
    setPage(Math.max(1, Math.min(p, totalPages)));

  // Page numbers to show (max 5)
  const pageNums = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => {
      const start = Math.max(
        1,
        Math.min(
          safePage - 2,
          totalPages - 4
        )
      );
      return start + i;
    }
  );

  return (
    <>
      {membersGroup && (
        <MembersModal
          group={membersGroup}
          onClose={() => setMembersGroup(null)}
          onUpdated={fetchGroups}
        />
      )}

      {editGroup && (
        <EditGroupModal
          group={editGroup}
          onClose={() => setEditGroup(null)}
          onSaved={() => {
            setEditGroup(null);
            fetchGroups();
          }}
        />
      )}

{/* Page header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Grupos</h1>
        <p className="mt-2 text-white/60">Todos los grupos registrados.</p>
      </div>

      {/* Search bar */}
      <div className="mb-4 relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
        />
        <input
          placeholder="Buscar por correo o nombre..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder:text-white/40 outline-none focus:border-white/30"
        />
      </div>

      {/* Count */}
      <p className="mb-4 text-right text-sm text-white/40">
        {filtered.length} grupos en total
      </p>

      {/* Cards */}
      <div className="space-y-3">
        {paginated.map((group) => {
          const miembros = group.miembros;
          const pct = Math.round(
            (miembros / SLOTS) * 100
          );

          return (
            <div
              key={group.id}
              className="
                flex
                items-center
                gap-6
                rounded-3xl
                border
                border-white/5
                bg-white/5
                px-6
                py-5
              "
            >
              {/* Group icon */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#134B5F]">
                <Users
                  size={24}
                  className="text-[#A8DADC]"
                />
              </div>

              {/* Name + email + dates */}
              <div className="w-56 shrink-0">
                <h3 className="text-lg font-semibold">
                  {group.nombre}
                </h3>

                <p className="mt-0.5 text-sm text-white/50">
                  {group.correo}
                </p>

                <div className="mt-2 flex items-center gap-1 text-xs text-white/40">
                  <Calendar size={12} />
                  <span>
                    Inicio:{" "}
                    {new Date(
                      group.fecha_inicio
                    ).toLocaleDateString("es-MX")}
                  </span>
                  <span className="mx-1">·</span>
                  <span>
                    Fin:{" "}
                    {new Date(
                      group.fecha_fin
                    ).toLocaleDateString("es-MX")}
                  </span>
                </div>
              </div>

              {/* Members */}
              <div className="flex-1">
                <p className="mb-2 text-sm text-white/60">
                  Miembros ({miembros}/{SLOTS})
                </p>

                <div className="mb-2 flex gap-1.5">
                  {Array.from({ length: SLOTS }).map(
                    (_, i) => {
                      const filled = i < miembros;
                      return filled ? (
                        <div
                          key={i}
                          className={`
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-full
                            text-xs
                            font-bold
                            text-white
                            ${AVATAR_COLORS[i]}
                          `}
                        >
                          {AVATAR_LETTERS[i]}
                        </div>
                      ) : (
                        <div
                          key={i}
                          className="
                            h-8
                            w-8
                            rounded-full
                            border-2
                            border-dashed
                            border-white/20
                          "
                        />
                      );
                    }
                  )}
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all ${barColor(pct)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <p className="mt-1 text-xs text-white/40">
                  {pct}% ocupado
                </p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setEditGroup(group)
                    }
                    className="
                      rounded-xl
                      bg-blue-500/10
                      p-2.5
                      text-blue-400
                      transition
                      hover:bg-blue-500/20
                    "
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() =>
                      deleteGroup(group.id)
                    }
                    className="
                      rounded-xl
                      bg-red-500/10
                      p-2.5
                      text-red-400
                      transition
                      hover:bg-red-500/20
                    "
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <button
                  onClick={() =>
                    setMembersGroup(group)
                  }
                  className="
                    flex
                    items-center
                    gap-1.5
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    px-4
                    py-2
                    text-sm
                    text-white/70
                    transition
                    hover:bg-white/10
                    hover:text-white
                  "
                >
                  <Users size={15} />
                  Ver miembros
                </button>
              </div>
            </div>
          );
        })}

        {paginated.length === 0 && (
          <p className="py-16 text-center text-white/30">
            No hay grupos que coincidan.
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => goTo(safePage - 1)}
            disabled={safePage === 1}
            className="
              flex
              items-center
              gap-1
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              py-2
              text-sm
              text-white/60
              transition
              hover:bg-white/10
              disabled:opacity-30
            "
          >
            <ChevronLeft size={16} />
            Anterior
          </button>

          {pageNums.map((n) => (
            <button
              key={n}
              onClick={() => goTo(n)}
              className={`
                h-9
                w-9
                rounded-xl
                text-sm
                transition
                ${
                  n === safePage
                    ? "bg-[#2B6C84] text-white"
                    : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }
              `}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => goTo(safePage + 1)}
            disabled={safePage === totalPages}
            className="
              flex
              items-center
              gap-1
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              py-2
              text-sm
              text-white/60
              transition
              hover:bg-white/10
              disabled:opacity-30
            "
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </>
  );
}
