"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

interface YandexMetrikaProps {
  yandexId?: string;
}

export function YandexMetrika({ yandexId }: YandexMetrikaProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!yandexId) return;

    // Вставка скрипта Яндекс.Метрики
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
      document.head.removeChild(script);
    };
  }, [yandexId]);

  // Отслеживание просмотра страниц
  useEffect(() => {
    if (yandexId && pathname) {
      trackPageView(pathname);
    }
  }, [yandexId, pathname]);

  return null;
}
