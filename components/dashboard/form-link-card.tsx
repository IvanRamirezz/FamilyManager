"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

const url = "https://family-manager-eight.vercel.app/solicitud";

export function FormLinkCard() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
      <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wide">
        Link del formulario
      </p>
      <div className="flex items-center gap-2">
        <span className="flex-1 min-w-0 truncate font-mono text-xs text-white/70 bg-white/10 px-3 py-2 rounded-xl">
          {url}
        </span>
        <button
          onClick={handleCopy}
          title="Copiar enlace"
          className="shrink-0 text-white/40 transition hover:text-white"
        >
          {copied
            ? <Check size={15} className="text-emerald-400" />
            : <Copy size={15} />}
        </button>
        <a
          href="/solicitud"
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir formulario"
          className="shrink-0 text-white/40 transition hover:text-white"
        >
          <ExternalLink size={15} />
        </a>
      </div>
    </div>
  );
}
