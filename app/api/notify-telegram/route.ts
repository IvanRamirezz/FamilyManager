import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text, email, whatsapp, nombre } = await req.json();

  // Build WhatsApp URL with pre-filled greeting
  const phone = (whatsapp as string).replace(/\D/g, "");
  const waText = encodeURIComponent(
    `Hola ${nombre}, recibimos tu solicitud para Nintendo Switch Online + Paquete de Expansión 🎮\n\nEn breve te asignamos un grupo y te enviamos los datos de acceso. ¡Gracias!`
  );
  const waUrl = `https://wa.me/${phone}?text=${waText}`;

  const body = {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "📋 Copiar correo", copy_text: { text: email } },
          { text: "💬 WhatsApp", url: waUrl },
        ],
        [
          { text: "✅ Continuar", callback_data: "show_payment" },
        ],
      ],
    },
  };

  const res = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
