"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Plus, Trash2, KeyRound } from "lucide-react";

const STORAGE_KEY = "fm_codigos_online";

interface Codigo {
  id: string;
  code: string;
}

export function CodigosCard() {
  const [codigos, setCodigos] = useState<Codigo[]>([]);
  const [code, setCode] = useState("");
  const [adding, setAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCodigos(JSON.parse(stored));
    } catch {}
  }, []);

  function save(next: Codigo[]) {
    setCodigos(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function handleAdd() {
    const trimmed = code.trim();
    if (!trimmed) return;
    save([...codigos, { id: crypto.randomUUID(), code: trimmed }]);
    setCode("");
    setAdding(false);
  }

  function handleDelete(id: string) {
    save(codigos.filter((c) => c.id !== id));
  }

  function handleCopy(c: Codigo) {
    navigator.clipboard.writeText(c.code);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <KeyRound size={16} className="text-[#A8DADC]" />
          <h2 className="text-base font-semibold">Códigos Online</h2>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1 rounded-xl bg-[#134B5F] px-3 py-1.5 text-xs transition hover:bg-[#1a6078]"
        >
          <Plus size={12} />
          Agregar
        </button>
      </div>

      {adding && (
        <div className="mb-4 flex gap-2">
          <input
            autoFocus
            placeholder="Código"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1 min-w-0 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 font-mono"
          />
          <button
            onClick={handleAdd}
            className="rounded-xl bg-[#2B6C84] px-3 py-2 text-sm transition hover:bg-[#34819d]"
          >
            OK
          </button>
        </div>
      )}

      {codigos.length === 0 ? (
        <p className="text-xs text-white/30 text-center py-6">
          Sin códigos guardados.
        </p>
      ) : (
        <div className="divide-y divide-white/5">
          {codigos.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2.5 gap-2">
              <span className="font-mono text-sm text-white bg-white/10 px-3 py-1 rounded-lg truncate flex-1">
                {c.code}
              </span>
              <button
                onClick={() => handleCopy(c)}
                className="shrink-0 text-white/40 transition hover:text-white"
                title="Copiar"
              >
                {copiedId === c.id
                  ? <Check size={14} className="text-emerald-400" />
                  : <Copy size={14} />}
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="shrink-0 text-white/30 transition hover:text-red-400"
                title="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
