"use client";

import { useEffect, useRef, useState } from "react";

import {
  User,
  Phone,
  Mail,
  MessageSquare,
  List,
  Copy,
  Check as CheckIcon,
  ExternalLink,
  MoreVertical,
  Plus,
  X,
  Pencil,
  Trash2,
  GripVertical,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

// ── Types ────────────────────────────────────────

type Tab = "Editor" | "Vista previa";

type FieldType =
  | "Texto corto"
  | "Texto largo"
  | "Número de teléfono"
  | "Correo"
  | "Opciones múltiples";

type IconName = "User" | "Phone" | "Mail" | "MessageSquare" | "List";

type Field = {
  id: string;
  iconName: IconName;
  label: string;
  titulo: string;
  type: FieldType;
  required: boolean;
  options?: string[];
};

type Solicitud = {
  id: string;
  nombre: string;
  whatsapp: string;
  usuario_nintendo: string;
  created_at: string;
  estado: string;
};

// ── Constants ────────────────────────────────────

const ICON_MAP: Record<IconName, React.ElementType> = {
  User,
  Phone,
  Mail,
  MessageSquare,
  List,
};

const TYPE_ICON: Record<FieldType, IconName> = {
  "Texto corto": "User",
  "Texto largo": "MessageSquare",
  "Número de teléfono": "Phone",
  "Correo": "Mail",
  "Opciones múltiples": "List",
};

const FIELD_TYPES: FieldType[] = [
  "Texto corto",
  "Texto largo",
  "Número de teléfono",
  "Correo",
  "Opciones múltiples",
];

const DEFAULT_FIELDS: Field[] = [
  { id: "1", iconName: "User",          label: "Nombre completo",     titulo: "¿Cuál es tu nombre completo?",                                           type: "Texto corto",          required: true  },
  { id: "2", iconName: "Phone",         label: "WhatsApp",            titulo: "Escribe tu número de WhatsApp para agregarte al grupo y tener contacto contigo", type: "Número de teléfono",   required: true  },
  { id: "3", iconName: "User",          label: "Usuario de Nintendo", titulo: "Escribe el nombre de usuario de tu cuenta Nintendo",                     type: "Texto corto",          required: true  },
  { id: "4", iconName: "Mail",          label: "Correo electrónico",  titulo: "Escribe tu correo vinculado a tu cuenta Nintendo",                       type: "Correo",               required: true  },
  { id: "5", iconName: "List",          label: "Grupo Familiar",      titulo: "¿Has estado anteriormente en una familia de Nintendo Switch Online?",    type: "Opciones múltiples",   required: true,  options: ["Sí", "No"] },
  { id: "6", iconName: "List",          label: "Tiempo en familia",   titulo: "¿Cuánto tiempo tiene que saliste de esa familia?",                       type: "Opciones múltiples",   required: false, options: ["Menos de 1 semana", "Más de 1 mes", "Más de 3 meses", "Más de 1 año"] },
];

const STORAGE_KEY = "fm_form_fields";

const STEPS = [
  { color: "bg-emerald-500", title: "Nueva solicitud recibida", desc: "La solicitud se guardará y aparecerá en la sección de Solicitudes." },
  { color: "bg-blue-500", title: "Revisión manual", desc: "Revisarás la información y decidirás si se acepta en un grupo." },
  { color: "bg-purple-500", title: "Asignación de grupo", desc: "Asignas la solicitud a un grupo disponible." },
  { color: "bg-[#A8DADC]", title: "Notificación por WhatsApp", desc: "Enviarás un mensaje de confirmación al usuario." },
];

const estadoBadge: Record<string, string> = {
  pendiente: "bg-yellow-500/15 text-yellow-400",
  aprobada: "bg-emerald-500/15 text-emerald-400",
  rechazada: "bg-red-500/15 text-red-400",
};

// ── Field Modal ──────────────────────────────────

interface FieldModalProps {
  initial?: Field;
  onSave: (f: Omit<Field, "id">) => void;
  onClose: () => void;
}

function FieldModal({ initial, onSave, onClose }: FieldModalProps) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [titulo, setTitulo] = useState(initial?.titulo ?? "");
  const [type, setType] = useState<FieldType>(initial?.type ?? "Texto corto");
  const [required, setRequired] = useState(initial?.required ?? true);
  const [options, setOptions] = useState<string[]>(initial?.options ?? ["Sí", "No"]);
  const [newOption, setNewOption] = useState("");

  const addOption = () => {
    const val = newOption.trim();
    if (!val || options.includes(val)) return;
    setOptions((o) => [...o, val]);
    setNewOption("");
  };

  const removeOption = (i: number) => setOptions((o) => o.filter((_, j) => j !== i));

  const handleSave = () => {
    if (!label.trim()) return;
    onSave({
      label: label.trim(),
      titulo: titulo.trim(),
      type,
      required,
      iconName: TYPE_ICON[type],
      options: type === "Opciones múltiples" ? options : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#071E26] p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {initial ? "Editar campo" : "Agregar campo"}
          </h2>

          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 p-2 transition hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-white/50">Nombre del campo <span className="text-white/30">(identificador interno)</span></p>
            <input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej. Correo electrónico"
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-white/50">Título del campo <span className="text-white/30">(pregunta que ve el usuario)</span></p>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Escribe tu correo vinculado a tu cuenta Nintendo"
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-white/50">Tipo de campo</p>

            <select
              value={type}
              onChange={(e) => setType(e.target.value as FieldType)}
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
              {FIELD_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Options editor — only for Opciones múltiples */}
          {type === "Opciones múltiples" && (
            <div className="space-y-2">
              <p className="text-sm text-white/50">Opciones</p>
              <div className="space-y-1.5">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span className="flex-1 text-sm">{opt}</span>
                    <button
                      onClick={() => removeOption(i)}
                      disabled={options.length <= 1}
                      className="text-white/30 transition hover:text-red-400 disabled:opacity-20"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  placeholder="Nueva opción…"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOption(); } }}
                  className="flex-1 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
                />
                <button
                  onClick={addOption}
                  disabled={!newOption.trim()}
                  className="rounded-xl bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20 disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <div>
              <p className="text-sm font-medium">Obligatorio</p>
              <p className="text-xs text-white/40">El usuario debe llenar este campo</p>
            </div>

            <button
              onClick={() => setRequired((v) => !v)}
              className={`
                relative
                h-6
                w-11
                rounded-full
                transition
                ${required ? "bg-[#2B6C84]" : "bg-white/20"}
              `}
            >
              <span
                className={`
                  absolute
                  top-0.5
                  h-5
                  w-5
                  rounded-full
                  bg-white
                  transition-all
                  ${required ? "left-5" : "left-0.5"}
                `}
              />
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
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
            onClick={handleSave}
            disabled={!label.trim()}
            className="
              flex-1
              rounded-2xl
              bg-[#2B6C84]
              py-3
              transition
              hover:bg-[#34819d]
              disabled:opacity-50
            "
          >
            {initial ? "Guardar cambios" : "Agregar campo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────

interface FormulariosViewProps {
  onNavigate: (view: string) => void;
}

export function FormulariosView({ onNavigate }: FormulariosViewProps) {
  const [tab, setTab] = useState<Tab>("Editor");
  const [fields, setFields] = useState<Field[]>(() => {
    if (typeof window === "undefined") return DEFAULT_FIELDS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_FIELDS;
  });
  const [recientes, setRecientes] = useState<Solicitud[]>([]);
  const [publicUrl, setPublicUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Which field's ⋮ menu is open
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  // Modal state: null = closed, "add" = adding new, Field = editing
  const [modal, setModal] = useState<null | "add" | Field>(null);

  // Drag & drop state
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFields(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
    setPublicUrl(window.location.origin + "/solicitud");
    fetchRecientes();
  }, []);

  // Persist to localStorage whenever fields change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
  }, [fields]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () =>
      document.removeEventListener("mousedown", handler);
  }, []);

  const fetchRecientes = async () => {
    const { data } = await supabase
      .from("solicitudes")
      .select(
        "id, nombre, whatsapp, usuario_nintendo, created_at, estado"
      )
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setRecientes(data);
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveField = (data: Omit<Field, "id">) => {
    if (modal === "add") {
      setFields((prev) => [
        ...prev,
        { ...data, id: crypto.randomUUID() },
      ]);
    } else if (modal && typeof modal === "object") {
      setFields((prev) =>
        prev.map((f) =>
          f.id === modal.id ? { ...f, ...data } : f
        )
      );
    }
    setModal(null);
  };

  const deleteField = (id: string) => {
    if (!confirm("¿Eliminar este campo?")) return;
    setFields((prev) => prev.filter((f) => f.id !== id));
    setOpenMenu(null);
  };

  return (
    <>
      {/* Field add/edit modal */}
      {modal !== null && (
        <FieldModal
          initial={modal === "add" ? undefined : (modal as Field)}
          onSave={saveField}
          onClose={() => setModal(null)}
        />
      )}

      <div>
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              Formulario de solicitud
            </h1>

            <p className="mt-2 text-white/60">
              Las personas llenan este formulario
              para unirse a un grupo.
            </p>
          </div>

          <a
            href="/solicitud"
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex
              items-center
              gap-2
              rounded-2xl
              border
              border-white/10
              bg-white/5
              px-5
              py-3
              text-sm
              transition
              hover:bg-white/10
            "
          >
            Ver formulario público
            <ExternalLink size={15} />
          </a>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-1 border-b border-white/10">
          {(["Editor", "Vista previa"] as Tab[]).map(
            (t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`
                  px-5
                  py-3
                  text-sm
                  transition
                  ${
                    tab === t
                      ? "border-b-2 border-[#A8DADC] text-white"
                      : "text-white/50 hover:text-white/80"
                  }
                `}
              >
                {t}
              </button>
            )
          )}
        </div>

        {/* ── EDITOR ── */}
        {tab === "Editor" && (
          <div className="grid grid-cols-3 gap-6">
            {/* Left col */}
            <div className="col-span-2 space-y-6">
              {/* Fields list */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <h2 className="text-lg font-semibold">
                  Campos del formulario
                </h2>

                <p className="mb-5 mt-1 text-sm text-white/40">
                  Personaliza los campos que verán
                  los usuarios.
                </p>

                <div className="space-y-3" ref={menuRef}>
                  {fields.map((field, index) => {
                    const Icon = ICON_MAP[field.iconName];
                    const isMenuOpen = openMenu === field.id;
                    const isOver = dragOver === index;

                    return (
                      <div
                        key={field.id}
                        draggable
                        onDragStart={() => { dragIndex.current = index; }}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(index); }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={() => {
                          if (dragIndex.current === null || dragIndex.current === index) {
                            setDragOver(null);
                            return;
                          }
                          setFields((prev) => {
                            const next = [...prev];
                            const [moved] = next.splice(dragIndex.current!, 1);
                            next.splice(index, 0, moved);
                            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                            return next;
                          });
                          dragIndex.current = null;
                          setDragOver(null);
                        }}
                        onDragEnd={() => { dragIndex.current = null; setDragOver(null); }}
                        className={`relative flex items-center justify-between rounded-2xl border bg-white/5 px-4 py-4 transition-colors ${
                          isOver ? "border-[#2B6C84] bg-[#2B6C84]/10" : "border-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Drag handle */}
                          <GripVertical size={16} className="shrink-0 cursor-grab text-white/20 active:cursor-grabbing" />

                          <div className="rounded-xl bg-white/10 p-2">
                            <Icon
                              size={16}
                              className="text-white/60"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium">
                              {field.label}
                            </p>

                            <p className="text-xs text-white/40">
                              {field.type}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`
                              rounded-full
                              px-3
                              py-0.5
                              text-xs
                              font-medium
                              ${
                                field.required
                                  ? "bg-blue-500/15 text-blue-400"
                                  : "bg-white/10 text-white/40"
                              }
                            `}
                          >
                            {field.required
                              ? "Obligatorio"
                              : "Opcional"}
                          </span>

                          {/* ⋮ Menu */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenMenu(
                                  isMenuOpen
                                    ? null
                                    : field.id
                                )
                              }
                              className="
                                rounded-xl
                                p-1
                                text-white/30
                                transition
                                hover:bg-white/10
                                hover:text-white/70
                              "
                            >
                              <MoreVertical
                                size={16}
                              />
                            </button>

                            {isMenuOpen && (
                              <div
                                className="
                                  absolute
                                  right-0
                                  top-8
                                  z-10
                                  min-w-[140px]
                                  rounded-2xl
                                  border
                                  border-white/10
                                  bg-[#0d2d3d]
                                  py-1
                                  shadow-xl
                                "
                              >
                                <button
                                  onClick={() => {
                                    setModal(field);
                                    setOpenMenu(null);
                                  }}
                                  className="
                                    flex
                                    w-full
                                    items-center
                                    gap-2
                                    px-4
                                    py-2
                                    text-sm
                                    text-white/70
                                    transition
                                    hover:bg-white/10
                                    hover:text-white
                                  "
                                >
                                  <Pencil size={14} />
                                  Editar
                                </button>

                                <button
                                  onClick={() =>
                                    deleteField(
                                      field.id
                                    )
                                  }
                                  className="
                                    flex
                                    w-full
                                    items-center
                                    gap-2
                                    px-4
                                    py-2
                                    text-sm
                                    text-red-400
                                    transition
                                    hover:bg-red-500/10
                                  "
                                >
                                  <Trash2 size={14} />
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add field button */}
                <button
                  onClick={() => setModal("add")}
                  className="
                    mt-4
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    border
                    border-dashed
                    border-white/20
                    py-4
                    text-sm
                    text-white/50
                    transition
                    hover:border-white/40
                    hover:text-white/80
                  "
                >
                  <Plus size={16} />
                  Agregar campo
                </button>
              </div>

              {/* Recent solicitudes */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    Solicitudes recientes
                  </h2>

                  <button
                    onClick={() =>
                      onNavigate("Solicitudes")
                    }
                    className="text-sm text-[#A8DADC] transition hover:underline"
                  >
                    Ver todas
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-xs text-white/40">
                        <th className="pb-3 font-normal">Nombre</th>
                        <th className="pb-3 font-normal">WhatsApp</th>
                        <th className="pb-3 font-normal">Usuario Nintendo</th>
                        <th className="pb-3 font-normal">Fecha</th>
                        <th className="pb-3 font-normal">Estado</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                      {recientes.map((s) => (
                        <tr key={s.id}>
                          <td className="py-3">{s.nombre}</td>
                          <td className="py-3 text-white/60">{s.whatsapp}</td>
                          <td className="py-3 text-white/60">{s.usuario_nintendo}</td>
                          <td className="py-3 text-white/60">
                            {new Date(
                              s.created_at
                            ).toLocaleDateString("es-MX")}
                          </td>
                          <td className="py-3">
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
                          </td>
                        </tr>
                      ))}

                      {recientes.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-10 text-center text-white/30"
                          >
                            No hay solicitudes aún.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {recientes.length > 0 && (
                  <button
                    onClick={() =>
                      onNavigate("Solicitudes")
                    }
                    className="mt-5 w-full text-center text-sm text-white/40 transition hover:text-white/70"
                  >
                    Ver todas las solicitudes →
                  </button>
                )}
              </div>
            </div>

            {/* Right panel */}
            <div className="space-y-6">
              {/* Link info */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <Mail size={20} className="text-white/60" />
                  </div>

                  <h2 className="font-semibold">
                    Información del formulario
                  </h2>
                </div>

                <p className="mb-4 text-sm text-white/50">
                  Comparte este enlace para que las
                  personas puedan llenar el formulario
                  de solicitud.
                </p>

                <div
                  className="
                    mb-3
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/10
                    px-4
                    py-3
                    text-sm
                    text-white/60
                  "
                >
                  <span className="flex-1 truncate">
                    {publicUrl}
                  </span>

                  <button
                    onClick={copyUrl}
                    className="shrink-0 text-white/40 transition hover:text-white"
                  >
                    {copied ? (
                      <CheckIcon
                        size={15}
                        className="text-emerald-400"
                      />
                    ) : (
                      <Copy size={15} />
                    )}
                  </button>
                </div>

                <button
                  onClick={copyUrl}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-[#2B6C84]
                    py-3
                    text-sm
                    transition
                    hover:bg-[#34819d]
                  "
                >
                  <Copy size={15} />
                  {copied ? "¡Copiado!" : "Copiar enlace"}
                </button>
              </div>

              {/* Steps */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <h2 className="mb-5 font-semibold">
                  ¿Qué sucede después?
                </h2>

                <div className="space-y-4">
                  {STEPS.map((step, i) => (
                    <div
                      key={step.title}
                      className="flex gap-3"
                    >
                      <span
                        className={`
                          mt-0.5
                          flex
                          h-6
                          w-6
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          text-xs
                          font-bold
                          text-white
                          ${step.color}
                        `}
                      >
                        {i + 1}
                      </span>

                      <div>
                        <p className="text-sm font-medium">
                          {step.title}
                        </p>

                        <p className="text-xs text-white/50">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── VISTA PREVIA ── */}
        {tab === "Vista previa" && (
          <div className="flex justify-center">
            <div
              className="
                w-full
                max-w-md
                rounded-3xl
                border
                border-white/10
                bg-white/5
                p-8
                backdrop-blur-xl
              "
            >
              <h2 className="mb-6 text-xl font-semibold">
                Solicitar un lugar
              </h2>

              <div className="space-y-4">
                {fields.map((field) => {
                  const isTextarea = field.type === "Texto largo";
                  const displayTitle = field.titulo || field.label;

                  return (
                    <div key={field.id} className="space-y-1.5">
                      <p className="text-sm text-white/80">
                        {displayTitle}
                        {field.required && <span className="ml-1 text-red-400">*</span>}
                      </p>
                      {field.type === "Opciones múltiples" ? (
                        <div className="space-y-1.5 pl-1">
                          {(field.options ?? ["Sí", "No"]).map((opt) => (
                            <label key={opt} className="flex cursor-not-allowed items-center gap-2 text-sm text-white/50">
                              <span className="h-4 w-4 rounded-full border border-white/30" />
                              {opt}
                            </label>
                          ))}
                        </div>
                      ) : isTextarea ? (
                        <textarea
                          placeholder="Tu respuesta"
                          disabled
                          rows={3}
                          className="w-full cursor-not-allowed resize-none rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white/40 outline-none"
                        />
                      ) : (
                        <input
                          placeholder="Tu respuesta"
                          disabled
                          className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white/40 outline-none"
                        />
                      )}
                    </div>
                  );
                })}

                <button
                  disabled
                  className="
                    w-full
                    cursor-not-allowed
                    rounded-2xl
                    bg-[#2B6C84]/50
                    px-5
                    py-3
                    text-white/50
                  "
                >
                  Enviar solicitud
                </button>
              </div>

              <p className="mt-5 text-center text-xs text-white/30">
                Vista previa — los campos no son
                interactivos aquí
              </p>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
