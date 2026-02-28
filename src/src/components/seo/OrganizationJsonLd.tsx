import { contacts } from "@/data";

export function OrganizationJsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DanMax",
    url: "https://danmax.moscow",
    telephone: contacts.phoneRaw,
    email: contacts.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: contacts.address.replace("Москва, ", ""),
      addressLocality: "Москва",
      addressRegion: "Московская область",
      postalCode: "121248",
      addressCountry: "RU",
    },
    logo: "https://danmax.moscow/images/logo.svg",
    sameAs: [
      contacts.telegram,
      contacts.whatsapp,
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "20:00",
    },
    areaServed: {
      "@type": "GeoShape",
      name: "Москва и Московская область",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
}
