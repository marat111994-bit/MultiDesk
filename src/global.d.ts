// Глобальные типы для аналитики

declare global {
  interface Window {
    // Яндекс.Метрика
    ym?: (id: number | string, method: string, ...args: unknown[]) => void;
    // Google Analytics 4
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export {};
