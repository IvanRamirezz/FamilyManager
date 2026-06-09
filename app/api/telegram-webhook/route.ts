import { NextRequest, NextResponse } from "next/server";

const API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function tg(method: string, body: object) {
  return fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function POST(req: NextRequest) {
  const update = await req.json();

  const cb = update.callback_query;
  if (cb?.data === "show_payment") {
    const chatId = cb.message.chat.id;
    const name = process.env.TELEGRAM_PAYMENT_NAME!;
    const number = process.env.TELEGRAM_PAYMENT_NUMBER!;

    await Promise.all([
      // Dismiss the loading spinner on the button
      tg("answerCallbackQuery", { callback_query_id: cb.id }),
      // Send payment info message
      tg("sendMessage", {
        chat_id: chatId,
        text: `💳 <b>Datos de pago</b>\n\n<b>Nombre:</b> ${name}\n<b>Número:</b> <code>${number}</code>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📋 Copiar número", copy_text: { text: number } }],
          ],
        },
      }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
