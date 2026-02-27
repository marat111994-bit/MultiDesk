import { Accordion } from "@/components/ui/Accordion";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import type { FaqItem } from "@/types";

interface FaqSectionProps {
  title: string;
  items: FaqItem[];
}

export function FaqSection({ title, items }: FaqSectionProps) {
  // Преобразуем FaqItem в формат для Accordion
  const accordionItems = items.map((item) => ({
    title: item.question,
    content: item.answer,
  }));

  return (
    <>
      {/* JSON-LD разметка для SEO */}
      <FaqJsonLd items={items} />

      <section className="py-20">
        <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 xl:px-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            {title}
          </h2>

          <div className="max-w-3xl mx-auto">
            <Accordion items={accordionItems} />
          </div>
        </div>
      </section>
    </>
  );
}
