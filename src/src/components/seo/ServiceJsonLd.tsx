import type { Service } from "@/types";

interface ServiceJsonLdProps {
  service: Service;
}

export function ServiceJsonLd({ service }: ServiceJsonLdProps) {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    serviceType: service.shortTitle,
    provider: {
      "@type": "Organization",
      name: "DanMax",
      url: "https://danmax.moscow",
    },
    areaServed: {
      "@type": "GeoShape",
      name: "Москва и Московская область",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Услуги по вывозу и утилизации",
      itemListElement: service.pricing.map((price) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: price.service,
        },
        priceSpecification: {
          "@type": "PriceSpecification",
          price: price.price,
          priceCurrency: "RUB",
          unitText: price.unit,
        },
      })),
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "156",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
    />
  );
}
