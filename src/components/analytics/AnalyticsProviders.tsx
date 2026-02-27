"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface AnalyticsProvidersProps {
  yandexId?: string;
  gaId?: string;
}

export function AnalyticsProviders({ yandexId, gaId }: AnalyticsProvidersProps) {
  const pathname = usePathname();

  // Загрузка Яндекс.Метрики
  useEffect(() => {
    if (!yandexId || typeof window === "undefined") return;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for(var j=0;j<document.scripts.length;j++){
          if(document.scripts[j].src===r)return;
        }
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

      ym(${yandexId}, "init", {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
        ecommerce: "dataLayer"
      });
    `;

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [yandexId]);

  // Загрузка GA4
  useEffect(() => {
    if (!gaId || typeof window === "undefined") return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

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
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      if (document.head.contains(initScript)) {
        document.head.removeChild(initScript);
      }
    };
  }, [gaId]);

  // Трекинг просмотров страниц
  useEffect(() => {
    if (!pathname || typeof window === "undefined") return;
    
    // Яндекс.Метрика
    if (yandexId && typeof (window as any).ym === "function") {
      (window as any).ym(yandexId, "hit", pathname);
    }
    
    // Google Analytics
    if (gaId && typeof (window as any).gtag === "function") {
      (window as any).gtag("config", gaId, {
        page_path: pathname,
      });
    }
  }, [pathname, yandexId, gaId]);

  return null;
}
