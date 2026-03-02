import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

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

    // Сохранение в базу данных
    await prisma.formSubmission.create({
      data: {
        name: validatedData.name,
        phone: validatedData.phone,
        serviceType: validatedData.serviceType || null,
        comment: validatedData.comment || null,
        source: request.headers.get("referer") || null,
      },
    });

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

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('contact: error', { message: error instanceof Error ? error.message : String(error) });

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
