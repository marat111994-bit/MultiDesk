import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Схема валидации
const contactSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  serviceType: z.string().optional(),
  comment: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Валидация данных
    const validatedData = contactSchema.parse(body);

    // Отправка в Telegram
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    if (telegramToken && telegramChatId) {
      const message = `
🔔 Новая заявка с сайта DanMax!

👤 Имя: ${validatedData.name}
📞 Телефон: ${validatedData.phone}
🏗 Услуга: ${validatedData.serviceType || "Не указана"}
💬 Комментарий: ${validatedData.comment || "—"}

📅 Дата: ${new Date().toLocaleString("ru-RU")}
      `.trim();

      await fetch(
        `https://api.telegram.org/bot${telegramToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: message,
            parse_mode: "HTML",
          }),
        }
      );
    }

    // TODO: Здесь можно добавить сохранение в базу данных или CRM

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing contact form:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ошибка валидации", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Ошибка при отправке заявки" },
      { status: 500 }
    );
  }
}
