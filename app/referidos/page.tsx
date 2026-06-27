"use client";

import { useState } from "react";
import { Copy, Share2, ChevronDown, Check } from "lucide-react";
import { Pixelify_Sans } from "next/font/google";

const pixelify = Pixelify_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-pixelify" });
import Image from "next/image";
import registroImg from "@/app/images/registro.png";
import headerImg from "@/app/images/Header.png";
import estrellaImg from "@/app/images/estrella.png";
import monedaImg from "@/app/images/moneda.png";
import regalo_RedImg from "@/app/images/regalo_red.png";
import trofeoImg from "@/app/images/trofeo.png";
import cofreImg from "@/app/images/regalo_red.png";
import usersImg from "@/app/images/users.png";
import regaloImg from "@/app/images/regalo.png";
import controlImg from "@/app/images/control.png";
import cuponImg from "@/app/images/cupon.png";
import whatsappImg from "@/app/images/whatsapp.png";
import discordImg from "@/app/images/discord.png";
import telegramImg from "@/app/images/telegram.png";
import progresoImg from "@/app/images/cupon.png";
import stepUserImg from "@/app/images/user.png";
import stepEnlaceImg from "@/app/images/enlace.png";
import stepCompartirImg from "@/app/images/compartir.png";
import stepTrofeoImg from "@/app/images/trofeo.png";

const C = {
  coral: "#D94F35",
  dark: "#1C3A27",
  sage: "#D3E1D9",
  cream: "#F5EFE0",
  card: "#EEE8D8",
  forest: "#7BA68A",
  teal: "#2D5A3D",
  green: "#4CAF72",
  wa: "#25D366",
  discord: "#5865F2",
  telegram: "#229ED9",
} as const;

const FAQS = [
  { q: "¿Cómo obtengo puntos?", a: "Cada vez que alguien se registra usando tu enlace de invitación, ganas puntos automáticamente." },
  { q: "¿Qué recompensas puedo conseguir?", a: "Cupones de descuento, códigos digitales, beneficios exclusivos y premios sorpresa semanales." },
  { q: "¿Los puntos caducan?", a: "Los puntos no caducan mientras tu cuenta esté activa en el sistema." },
  { q: "¿Cómo se verifica mi cuenta?", a: "Tu usuario de Nintendo se verifica automáticamente contra nuestra base de datos al registrarte." },
  { q: "¿Existe límite de referidos?", a: "¡No hay límite! Invita a cuantas personas quieras y acumula puntos sin restricciones." },
  { q: "¿Cuándo recibo mis recompensas?", a: "Las recompensas se entregan dentro de las primeras 24-48 horas de alcanzar el nivel de puntos." },
];

const MILESTONES = [
  { pts: 100,  img: monedaImg,    label: "Cupón de descuento" },
  { pts: 250,  img: regalo_RedImg, label: "Código digital sorpresa" },
  { pts: 500,  img: trofeoImg,    label: "Recompensa premium" },
  { pts: 1000, img: cofreImg,     label: "Premio especial" },
];

const REWARDS = [
  { img: controlImg,  label: "Recompensas digitales", desc: "Códigos de juegos, contenido y más." },
  { img: cuponImg,    label: "Descuentos",             desc: "Ahorra en tus compras favoritas." },
  { img: estrellaImg, label: "Beneficios especiales",  desc: "Acceso anticipado, roles exclusivos y más." },
  { img: regaloImg,   label: "Premios sorpresa",       desc: "Sorpresas increíbles cada semana." },
];

const STEPS = [
  { step: 1, imgKey: "user",      title: "Ingresa tu usuario",      desc: "Validamos automáticamente tu cuenta." },
  { step: 2, imgKey: "enlace",    title: "Obtén tu enlace",         desc: "Se genera un enlace único de invitación." },
  { step: 3, imgKey: "compartir", title: "Comparte con tus amigos", desc: "WhatsApp, Discord, Telegram y redes sociales." },
  { step: 4, imgKey: "trofeo",    title: "Gana puntos",             desc: "Cada registro exitoso suma recompensas." },
];

export default function ReferidosPage() {
  const [username, setUsername] = useState("");
  const [registered, setRegistered] = useState(false);
  const [registeredUser, setRegisteredUser] = useState("");
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleRegister = () => {
    const trimmed = username.trim();
    if (!trimmed) return;
    setRegisteredUser(trimmed);
    setRegistered(true);
    setTimeout(() => {
      document.getElementById("panel")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const refLink = `misitio.com/ref/${registeredUser.toLowerCase()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${pixelify.variable} referidos-page min-h-screen`} style={{ backgroundColor: C.sage, fontFamily: "var(--font-pixelify, sans-serif)" }}>
      <style>{`
        .referidos-page h1,
        .referidos-page h2,
        .referidos-page h3,
        .referidos-page .pixel-font {
          font-family: var(--font-pixelify), sans-serif;
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50" style={{ backgroundColor: C.sage }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌲</span>
            <span className="pixel-font font-black text-lg" style={{ color: C.dark }}>Quiet Place</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Inicio", "Cómo funciona", "Recompensas", "FAQ", "Contacto"].map(l => (
              <a key={l} href="#" className="text-sm font-semibold hover:opacity-60 transition-opacity" style={{ color: C.dark }}>{l}</a>
            ))}
          </div>
          <button
            onClick={() => document.getElementById("registro")?.scrollIntoView({ behavior: "smooth" })}
            className="px-5 py-2.5 rounded-full text-sm font-bold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: C.coral }}
          >
            Comenzar ahora →
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-black leading-tight mb-5" style={{ color: C.dark }}>
            Invita amigos y{" "}
            <span style={{ color: C.coral }}>gana recompensas</span>
          </h1>
          <p className="pixel-font text-lg mb-8 opacity-75" style={{ color: C.dark }}>
            Registra tu usuario, comparte tu enlace y acumula puntos para desbloquear descuentos y recompensas exclusivas.
          </p>
          <div className="flex flex-wrap gap-4 mb-10">
            <button
              onClick={() => document.getElementById("registro")?.scrollIntoView({ behavior: "smooth" })}
              className="px-6 py-3 rounded-full font-bold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: C.coral }}
            >
              Comenzar ahora →
            </button>
            <button
              onClick={() => document.getElementById("recompensas")?.scrollIntoView({ behavior: "smooth" })}
              className="px-6 py-3 rounded-full font-bold border-2 hover:opacity-70 transition-opacity bg-transparent"
              style={{ borderColor: C.dark, color: C.dark }}
            >
              Ver recompensas
            </button>
          </div>
          <div className="flex flex-wrap gap-6">
            {[
              { img: estrellaImg, label: "Sistema de puntos" },
              { img: usersImg,    label: "Usuarios activos" },
              { img: regaloImg,   label: "Recompensas semanales" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="relative w-6 h-6 shrink-0">
                  <Image src={item.img} alt={item.label} fill sizes="24px" className="object-contain" />
                </div>
                <span className="text-sm font-semibold" style={{ color: C.dark }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero image */}
        <div className="relative h-105">
          <Image
            src={headerImg}
            alt="Hero ilustración"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            priority
          />
          {/* Fade edges to match page background */}
          <div className="absolute inset-y-0 left-0 w-16 pointer-events-none" style={{ background: `linear-gradient(to right, ${C.sage}, transparent)` }} />
          <div className="absolute inset-y-0 right-0 w-16 pointer-events-none" style={{ background: `linear-gradient(to left, ${C.sage}, transparent)` }} />
          <div className="absolute inset-x-0 top-0 h-16 pointer-events-none" style={{ background: `linear-gradient(to bottom, ${C.sage}, transparent)` }} />
          <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none" style={{ background: `linear-gradient(to top, ${C.sage}, transparent)` }} />
        </div>
      </section>

      {/* ── Registration card ── */}
      <section className="max-w-6xl mx-auto px-6 pb-16" id="registro">
        <div className="rounded-3xl overflow-hidden shadow-lg" style={{ backgroundColor: C.cream }}>
          <div className="grid md:grid-cols-5">
            {/* Image left */}
            <div className="md:col-span-2 relative min-h-44 overflow-hidden">
              <Image
                src={registroImg}
                alt="Ilustración registro"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
              {/* Fade to cream on the right edge */}
              <div
                className="absolute inset-y-0 right-0 w-16 pointer-events-none"
                style={{ background: `linear-gradient(to right, transparent, ${C.cream})` }}
              />
            </div>

            {/* Form right */}
            <div className="md:col-span-3 px-8 py-7 flex flex-col justify-center">
              <h2 className="text-3xl font-black mb-2" style={{ color: C.dark }}>Ingresa tu usuario</h2>
              <p className="mb-7 opacity-65 text-sm" style={{ color: C.dark }}>Tu cuenta será verificada automáticamente.</p>
              <div className="flex gap-3 mb-6">
                <div
                  className="flex-1 flex items-center gap-3 rounded-full border-2 px-5 py-3 bg-white"
                  style={{ borderColor: "#C8C0B0" }}
                >
                  <span className="text-gray-400 text-sm">👤</span>
                  <input
                    type="text"
                    placeholder="Ejemplo: JuanPerez123"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleRegister()}
                    className="flex-1 outline-none text-sm bg-transparent"
                    style={{ color: C.dark }}
                  />
                </div>
                <button
                  onClick={handleRegister}
                  className="px-6 py-3 rounded-full font-bold text-white whitespace-nowrap hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: C.coral }}
                >
                  Registrarme →
                </button>
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: C.dark }}>
                  <span className="font-bold">✓</span>
                  <span>Verificación automática</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: C.dark }}>
                  <span className="relative w-5 h-5 shrink-0 inline-block">
                    <Image src={stepCompartirImg} alt="compartir" fill sizes="20px" className="object-contain" />
                  </span>
                  <span>Enlace de invitación instantáneo</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: C.dark }}>
                  <span className="relative w-5 h-5 shrink-0 inline-block">
                    <Image src={regalo_RedImg} alt="regalo_red" fill sizes="20px" className="object-contain" />
                  </span>
                  <span>Sistema de recompensas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-6xl mx-auto px-6 pb-16" id="como-funciona">
        <h2 className="text-3xl font-black text-center mb-12 flex items-center justify-center gap-3" style={{ color: C.dark }}>
          <span className="text-2xl">🌿</span> ¿Cómo funciona? <span className="text-2xl">🌿</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STEPS.map((item, i) => (
            <div key={item.step} className="relative">
              {i < 3 && (
                <div
                  className="hidden md:block absolute top-9 z-10 border-t-2 border-dashed"
                  style={{ borderColor: "#5A8A6A", left: "calc(50% + 2.5rem)", width: "calc(100% - 5rem)" }}
                />
              )}
              <div className="rounded-2xl p-6 text-center shadow-sm" style={{ backgroundColor: C.cream }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-lg mx-auto mb-4"
                  style={{ backgroundColor: C.dark }}
                >
                  {item.step}
                </div>
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <Image
                    src={{ user: stepUserImg, enlace: stepEnlaceImg, compartir: stepCompartirImg, trofeo: stepTrofeoImg }[item.imgKey]!}
                    alt={item.title}
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
                <h3 className="font-black text-sm mb-1" style={{ color: C.dark }}>{item.title}</h3>
                <p className="text-xs opacity-65" style={{ color: C.dark }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Rewards + Progress ── */}
      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-6" id="recompensas">
        {/* Rewards */}
        <div className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: C.cream }}>
          <h3 className="font-black text-lg mb-6" style={{ color: C.dark }}>Recompensas que puedes obtener</h3>
          <div className="grid grid-cols-2 gap-4">
            {REWARDS.map(r => (
              <div key={r.label} className="rounded-xl p-4" style={{ backgroundColor: "#D3E1D9" }}>
                <div className="relative w-12 h-12 mb-3">
                  <Image src={r.img} alt={r.label} fill sizes="48px" className="object-contain" />
                </div>
                <div className="font-bold text-xs mb-1" style={{ color: C.dark }}>{r.label}</div>
                <div className="text-xs opacity-60" style={{ color: C.dark }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: C.cream }}>
          <h3 className="font-black text-lg mb-6" style={{ color: C.dark }}>Progreso y desbloquea mejores recompensas</h3>
          <div className="flex justify-between mb-6">
            {MILESTONES.map(m => (
              <div key={m.pts} className="flex flex-col items-center text-center" style={{ width: "22%" }}>
                <div className="relative w-10 h-10 mb-1 mx-auto">
                  <Image src={m.img} alt={m.label} fill sizes="40px" className="object-contain" />
                </div>
                <div className="font-black text-sm" style={{ color: C.dark }}>{m.pts}</div>
                <div className="font-semibold text-xs opacity-55 mb-1" style={{ color: C.dark }}>puntos</div>
                <div className="text-xs opacity-70 leading-tight" style={{ color: C.dark }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#D8D2C2" }}>
            <div className="h-full rounded-full" style={{ width: "60%", backgroundColor: C.green }} />
          </div>
          <div className="flex justify-between mt-2 text-xs" style={{ color: C.dark }}>
            <span className="opacity-65">300 / 500 puntos</span>
            <span className="font-bold">60% completado</span>
          </div>
        </div>
      </section>

      {/* ── User Panel ── */}
      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-6" id="panel">
        {/* Stats card */}
        <div className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: C.cream }}>
          <h3 className="font-black text-lg mb-6" style={{ color: C.dark }}>Tu panel de referidos</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden" style={{ backgroundColor: C.forest }}>
              <Image src={stepUserImg} alt="avatar" fill sizes="80px" className="object-cover" />
            </div>
            <div>
              <div className="font-black text-lg" style={{ color: C.dark }}>
                {registered ? registeredUser : "JuanPerez123"}
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full text-white" style={{ backgroundColor: C.coral }}>
                <span className="relative w-6 h-6 shrink-0 inline-block">
                  <Image src={controlImg} alt="control" fill sizes="24px" className="object-contain" />
                </span>
                Grupo #15
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { img: usersImg,    label: "Invitados", value: registered ? "0" : "15" },
              { img: estrellaImg, label: "Puntos",    value: registered ? "0" : "300" },
              { img: progresoImg, label: "Progreso",  value: registered ? "0%" : "60%" },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: C.card }}>
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <Image src={stat.img} alt={stat.label} fill sizes="48px" className="object-contain" />
                </div>
                <div className="font-black text-lg" style={{ color: C.dark }}>{stat.value}</div>
                <div className="text-xs opacity-60" style={{ color: C.dark }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="text-sm font-bold mb-2" style={{ color: C.dark }}>Tu enlace de invitación</div>
            <div className="flex items-center gap-2 rounded-xl p-3" style={{ backgroundColor: C.card }}>
              <span className="text-sm flex-1 truncate opacity-80" style={{ color: C.dark }}>
                {registered ? refLink : "misitio.com/ref/juanperez123"}
              </span>
              <button onClick={registered ? handleCopy : undefined} className="p-1 rounded hover:opacity-70 transition-opacity">
                {copied ? <Check size={16} color={C.green} /> : <Copy size={16} color={C.dark} />}
              </button>
            </div>
          </div>
        </div>

        {/* Share card */}
        <div className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: C.cream }}>
          <h3 className="font-black text-lg mb-6" style={{ color: C.dark }}>Comparte tu enlace</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={registered ? handleCopy : undefined}
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-2 hover:opacity-80 transition-opacity"
              style={{ borderColor: "#C8C0B0", color: C.dark }}
            >
              <Copy size={15} />
              {copied ? "¡Copiado!" : "Copiar enlace"}
            </button>
            <button
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-2 hover:opacity-80 transition-opacity"
              style={{ borderColor: "#C8C0B0", color: C.dark }}
            >
              <Share2 size={15} /> Compartir
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href={registered ? `https://wa.me/?text=${encodeURIComponent(`Únete a mi grupo de Nintendo Online 🎮 ${refLink}`)}` : "#"}
              target={registered ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: C.wa }}
            >
              <span className="relative w-5 h-5 shrink-0"><Image src={whatsappImg} alt="WhatsApp" fill sizes="20px" className="object-contain" /></span>
              WhatsApp
            </a>
            <a
              href={registered ? "https://discord.com/channels/@me" : "#"}
              target={registered ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: C.discord }}
            >
              <span className="relative w-5 h-5 shrink-0"><Image src={discordImg} alt="Discord" fill sizes="20px" className="object-contain" /></span>
              Discord
            </a>
            <a
              href={registered ? `https://t.me/share/url?url=${encodeURIComponent(refLink)}` : "#"}
              target={registered ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: C.telegram }}
            >
              <span className="relative w-5 h-5 shrink-0"><Image src={telegramImg} alt="Telegram" fill sizes="20px" className="object-contain" /></span>
              Telegram
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-6xl mx-auto px-6 pb-16 relative" id="faq">
        <h2 className="text-3xl font-black text-center mb-12 flex items-center justify-center gap-3" style={{ color: C.dark }}>
          <span className="text-2xl">🌿</span> Preguntas frecuentes <span className="text-2xl">🌿</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: C.cream }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-sm hover:opacity-75 transition-opacity"
                style={{ color: C.dark }}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  className="flex-shrink-0 transition-transform duration-200"
                  style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm leading-relaxed opacity-70" style={{ color: C.dark }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: C.dark }}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🌲</span>
                <span className="font-black text-lg text-white">Quiet Place</span>
              </div>
              <p className="text-xs text-white opacity-50 leading-relaxed">
                Sistema de referidos para grupos de Nintendo Online.
              </p>
            </div>
            <div>
              <div className="text-xs font-bold text-white opacity-40 mb-3 uppercase tracking-widest">Navegación</div>
              {["Inicio", "Cómo funciona", "Recompensas", "Contacto"].map(l => (
                <a key={l} href="#" className="block text-sm text-white opacity-65 hover:opacity-100 transition-opacity mb-1.5">{l}</a>
              ))}
            </div>
            <div>
              <div className="text-xs font-bold text-white opacity-40 mb-3 uppercase tracking-widest">Soporte</div>
              {["FAQ", "Política de privacidad", "Condiciones"].map(l => (
                <a key={l} href="#" className="block text-sm text-white opacity-65 hover:opacity-100 transition-opacity mb-1.5">{l}</a>
              ))}
            </div>
            <div className="flex items-center md:justify-end">
              <button
                onClick={() => document.getElementById("registro")?.scrollIntoView({ behavior: "smooth" })}
                className="px-6 py-3 rounded-full font-bold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: C.coral }}
              >
                Crear mi enlace →
              </button>
            </div>
          </div>
          <div className="border-t border-white border-opacity-10 pt-6 text-center text-xs text-white opacity-30">
            © 2025 Quiet Place. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
