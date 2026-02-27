"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

interface GoogleAnalyticsProps {
  gaId?: string;
}

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!gaId) return;

    // Вставка скрипта GA4
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Инициализация gtag
    const initScript = document.createElement("script");
    initScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}', {
        page_path: window.location.pathname,
      });
    `;
    document.head.appendChild(initScript);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(initScript);
    };
  }, [gaId]);

  // Отслеживание просмотра страниц
  useEffect(() => {
    if (gaId && pathname) {
      trackPageView(pathname);
    }
  }, [gaId, pathname]);

  return null;
}
