/**
 * Аналитика: Яндекс.Метрика и Google Analytics 4
 */

type AnalyticsEvent =
  | "form_submit"
  | "calculator_use"
  | "phone_click"
  | "telegram_click"
  | "whatsapp_click"
  | "cta_click"
  | "file_download"
  | "outbound_link";

interface AnalyticsParams {
  [key: string]: string | number | boolean;
}

/**
 * Отправка события в Яндекс.Метрику и GA4
 */
export function trackGoal(
  eventName: AnalyticsEvent,
  params?: AnalyticsParams
) {
  if (typeof window === "undefined") return;

  const w = window as any;

  // Яндекс.Метрика
  if (w.ym && process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID) {
    w.ym(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID, "reachGoal", eventName, params);
  }

  // Google Analytics 4
  if (w.gtag && process.env.NEXT_PUBLIC_GA_ID) {
    w.gtag("event", eventName, params);
  }

  // Логирование в development
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", eventName, params);
  }
}

/**
 * Отслеживание просмотра страницы
 */
export function trackPageView(path: string) {
  if (typeof window === "undefined") return;

  const w = window as any;

  // Яндекс.Метрика
  if (w.ym && process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID) {
    w.ym(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID, "hit", path);
  }

  // Google Analytics 4
  if (w.gtag && process.env.NEXT_PUBLIC_GA_ID) {
    w.gtag("config", process.env.NEXT_PUBLIC_GA_ID, {
      page_path: path,
    });
  }
}

/**
 * Хелперы для отслеживания конкретных действий
 */
export const track = {
  formSubmit: (serviceType?: string) =>
    trackGoal("form_submit", { serviceType: serviceType || "unknown" }),

  calculatorUse: () => trackGoal("calculator_use"),

  phoneClick: (phone: string) =>
    trackGoal("phone_click", { phone }),

  telegramClick: () => trackGoal("telegram_click"),

  whatsappClick: () => trackGoal("whatsapp_click"),

  ctaClick: (buttonName: string) =>
    trackGoal("cta_click", { button_name: buttonName }),

  fileDownload: (fileName: string) =>
    trackGoal("file_download", { file_name: fileName }),

  outboundLink: (url: string) =>
    trackGoal("outbound_link", { url }),
};
